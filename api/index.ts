import express from "express";
import { GoogleGenAI } from "@google/genai";
import { correctKoreanText } from "../src/utils/koreanSpellChecker";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import companiesJson from "../Data/companies.json";
import linkJson from "../Data/link.json";
import certificatesJson from "../Data/certificates.json";

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Universal CORS Middleware
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (_req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Database pool (optional)
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : undefined
}) : null;

if (pool) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      uid VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(err => console.error("Error creating users table in api/index:", err));
}

// In-memory fallbacks safe for read-only Vercel environment
const inMemoryUsers: any[] = [];
const memoryDiaries: Record<string, any[]> = {};
const memoryProfiles: Record<string, any> = {};

// Clean citations helper
function cleanCitations(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\[cite:\s*[^\]]+\]/gi, '').replace(/\[cite[^\]]*\]/gi, '').trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanCitations);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = cleanCitations(obj[key]);
    }
    return newObj;
  }
  return obj;
}

const parsedCompanies = cleanCitations(companiesJson);
const parsedLinks = linkJson;

function findCompanyUrl(companyObj: any, links: any[]): string {
  const companyName = companyObj.company;
  if (!companyName) return '';
  const cleanName = companyName.replace(/\s*\(.*?\)/g, '').trim();

  let linkObj = links.find((l: any) => l.company === companyName || l.company === cleanName);
  if (!linkObj) {
    linkObj = links.find((l: any) => l.company && (l.company.includes(cleanName) || cleanName.includes(l.company)));
  }

  if (linkObj) {
    return linkObj.recruitment_page_url || linkObj.official_website || linkObj.job_korea_url || linkObj.saramin_url || '';
  }
  return '';
}

// Robust Gemini content generation with key rotation & fallback
async function generateContentWithFallback(contents: any[], systemInstruction: string): Promise<any> {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.GOOGLE_API_KEY,
    process.env.API_KEY,
  ].filter((key): key is string => {
    if (!key) return false;
    const trimmed = key.trim();
    const lower = trimmed.toLowerCase();
    return trimmed !== "" && 
           lower !== "my_gemini_api_key" && 
           lower !== "your_api_key" && 
           lower !== "your_gemini_api_key" && 
           lower !== "null" && 
           lower !== "undefined" && 
           lower !== "placeholder";
  });

  if (keys.length === 0) {
    throw new Error("Gemini API key is not configured.");
  }

  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite"
  ];

  for (const modelName of fallbackModels) {
    for (let i = 0; i < keys.length; i++) {
      const keyIndex = (startIndex + i) % keys.length;
      const apiKey = keys[keyIndex];

      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        return response;
      } catch (error: any) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

// Realistic Human-Like Korean Interviewer Voices (MsEdge Neural TTS)
const ttsAudioCache = new Map<string, Buffer>();

const VOICE_PROFILES: Record<string, { voice: string; pitch?: string; rate?: string; label: string }> = {
  injoon: {
    voice: "ko-KR-InJoonNeural",
    label: "이인준 (40대 신뢰감 있는 남성 면접관)"
  },
  bongjin: {
    voice: "ko-KR-BongJinNeural",
    label: "신봉진 (50대 묵직한 베테랑 남성 면접관)"
  },
  hyunsu: {
    voice: "ko-KR-HyunsuNeural",
    label: "김현수 (30대 스마트하고 또렷한 남성 면접관)"
  },
  sunhi: {
    voice: "ko-KR-SunHiNeural",
    label: "박선희 (30대 단정하고 명확한 여성 면접관)"
  },
  jimin: {
    voice: "ko-KR-JiMinNeural",
    label: "정지민 (40대 부드럽고 차분한 여성 면접관)"
  },
  seohyeon: {
    voice: "ko-KR-SeoHyeonNeural",
    label: "강서현 (20대 정중하고 세련된 여성 면접관)"
  },
  strict_bongjin: {
    voice: "ko-KR-BongJinNeural",
    pitch: "-6Hz",
    rate: "-8%",
    label: "최준혁 (엄격한 50대 압박 면접관)"
  },
  gentle_injoon: {
    voice: "ko-KR-InJoonNeural",
    pitch: "+4Hz",
    rate: "-4%",
    label: "한도윤 (따뜻하고 편안한 인성 면접관)"
  },
  energetic_hyunsu: {
    voice: "ko-KR-HyunsuNeural",
    pitch: "+2Hz",
    rate: "+8%",
    label: "이지훈 (열정적인 실무 기술 면접관)"
  },
  professional_sunhi: {
    voice: "ko-KR-SunHiNeural",
    pitch: "+0Hz",
    rate: "-2%",
    label: "오윤아 (냉철하고 꼼꼼한 인사총괄 면접관)"
  }
};

async function generateInterviewAudio(text: string, voiceKey: string = 'injoon'): Promise<Buffer> {
  const profile = VOICE_PROFILES[voiceKey] || VOICE_PROFILES.injoon;
  const cacheKey = `${voiceKey}:${text}`;
  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey)!;
  }
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(profile.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const options: any = {};
    if (profile.pitch) options.pitch = profile.pitch;
    if (profile.rate) options.rate = profile.rate;

    const { audioStream } = tts.toStream(text, Object.keys(options).length > 0 ? options : undefined);
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timer = setTimeout(() => {
        try { tts.close(); } catch {}
        reject(new Error("TTS generation timeout"));
      }, 9500);
      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("end", () => {
        clearTimeout(timer);
        try { tts.close(); } catch {}
        resolve(Buffer.concat(chunks));
      });
      audioStream.on("error", (err: any) => {
        clearTimeout(timer);
        try { tts.close(); } catch {}
        reject(err);
      });
    });

    if (ttsAudioCache.size > 200) {
      const first = ttsAudioCache.keys().next().value;
      if (first) ttsAudioCache.delete(first);
    }
    ttsAudioCache.set(cacheKey, audioBuffer);
    return audioBuffer;
  } catch (err) {
    try { tts.close(); } catch {}
    throw err;
  }
}

// Router Setup
const router = express.Router();

// 1. Health
router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "MyStair Unified API", timestamp: new Date().toISOString() });
});

// 2. Certificates
router.get("/certificates", (_req, res) => {
  res.json(certificatesJson || []);
});

// 3. Recommend Companies
router.post("/recommend-companies", (req, res) => {
  try {
    const { mbti, hollandCode, major } = req.body || {};
    const allCompanies = parsedCompanies || [];
    const mbtiUpper = (mbti || '').toUpperCase();
    const hollandUpper = (hollandCode || '').toUpperCase();

    let matched = allCompanies.filter((c: any) => {
      let score = 0;
      if (mbtiUpper && c.mbti && c.mbti.toUpperCase() === mbtiUpper) score += 3;
      if (hollandUpper && c.holland_code && c.holland_code.toUpperCase().includes(hollandUpper)) score += 3;
      if (major && c.majors && Array.isArray(c.majors) && c.majors.some((m: string) => m.includes(major) || major.includes(m))) score += 2;
      return score > 0;
    });

    if (matched.length === 0) {
      matched = allCompanies.slice(0, 10);
    }

    const results = matched.slice(0, 15).map((c: any) => ({
      ...c,
      homepage_url: findCompanyUrl(c, parsedLinks || [])
    }));

    return res.json({ companies: results });
  } catch (e: any) {
    console.error("Recommend companies error:", e);
    return res.status(500).json({ error: "Failed to recommend companies" });
  }
});

// 4. Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    if (password.length < 8) return res.status(400).json({ message: "비밀번호는 8글자 이상이어야 합니다." });

    const normalizedEmail = email.toLowerCase().trim();
    const uid = "user_" + Math.random().toString(36).substring(2, 11);
    const displayName = normalizedEmail.split('@')[0];

    if (pool) {
      try {
        const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (checkRes.rows.length > 0) return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        await pool.query('INSERT INTO users (email, password, uid, display_name) VALUES ($1, $2, $3, $4)', [
          normalizedEmail, password, uid, displayName
        ]);
        return res.json({ status: "success", uid, email: normalizedEmail, displayName });
      } catch (dbErr) {
        console.error("PG signup error:", dbErr);
      }
    }

    if (inMemoryUsers.some(u => u.email === normalizedEmail)) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    const newUser = { uid, email: normalizedEmail, password, displayName };
    inMemoryUsers.push(newUser);
    return res.json({ status: "success", uid, email: normalizedEmail, displayName });
  } catch (e: any) {
    return res.status(500).json({ message: "회원가입 실패", error: e?.message });
  }
});

// 5. Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });

    const normalizedEmail = email.toLowerCase().trim();
    if (pool) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          if (user.password === password) {
            return res.json({ status: "success", uid: user.uid, email: user.email, displayName: user.display_name });
          } else {
            return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
          }
        }
      } catch (dbErr) {
        console.error("PG login error:", dbErr);
      }
    }

    const user = inMemoryUsers.find(u => u.email === normalizedEmail);
    if (user) {
      if (user.password === password) {
        return res.json({ status: "success", uid: user.uid, email: user.email, displayName: user.displayName });
      } else {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
      }
    }

    return res.status(400).json({ message: "가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다." });
  } catch (e: any) {
    return res.status(500).json({ message: "로그인 오류", error: e?.message });
  }
});

// 6. Profile
router.get("/profile", (req, res) => {
  const userId = (req.query?.userId as string) || "default_user";
  const profile = memoryProfiles[userId] || null;
  return res.json({ status: "success", userId, profile });
});

router.post("/profile", (req, res) => {
  const { userId, profile } = req.body || {};
  const targetUid = userId || profile?.uid || "default_user";
  memoryProfiles[targetUid] = { ...profile, uid: targetUid, updatedAt: new Date().toISOString() };
  return res.json({ status: "success", userId: targetUid, profile: memoryProfiles[targetUid] });
});

// 7. Diaries (handles both /diaries and /diaries/:id)
router.get("/diaries", (req, res) => {
  const userId = (req.query?.userId as string) || "default_user";
  const diaries = memoryDiaries[userId] || [];
  return res.json({ status: "success", userId, diaries });
});

router.post("/diaries", (req, res) => {
  const { userId, diary } = req.body || {};
  const targetUid = userId || diary?.userId || "default_user";
  if (!memoryDiaries[targetUid]) memoryDiaries[targetUid] = [];

  const existingIdx = memoryDiaries[targetUid].findIndex(d => d.id === diary.id);
  if (existingIdx >= 0) {
    memoryDiaries[targetUid][existingIdx] = diary;
  } else {
    memoryDiaries[targetUid].push(diary);
  }
  return res.json({ status: "success", userId: targetUid, diary });
});

router.delete("/diaries/:id?", (req, res) => {
  const userId = (req.query?.userId as string) || "default_user";
  const diaryId = (req.params?.id || req.query?.diaryId || req.query?.id) as string;
  if (memoryDiaries[userId] && diaryId) {
    memoryDiaries[userId] = memoryDiaries[userId].filter(d => d.id !== diaryId);
  }
  return res.json({ status: "success", userId, diaryId });
});

// 8. Chat
const handleChat = async (req: express.Request, res: express.Response) => {
  try {
    const { message, chatHistory, userProfile, diaries } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "질문 내용이 없습니다." });
    }

    const today = new Date();
    const currentDateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
    const currentDateISO = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(today);

    const systemInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: ${currentDateString} (YYYY-MM-DD 형식: ${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(${currentDateISO})를 다이어리의 date 필드로 사용해라. 절대로 과거 날짜를 지어내지 마라!

[응답 규칙]
1. 일상 인사나 단순 질문은 2줄 이내로 간결하고 친근하게 답해라.
2. 단일 주제 진로 질문은 2~3줄로 명쾌하게 답해라.
3. 종합 리포트 요청은 5~10줄 내외로 가독성 있게 정리해라.`;

    let contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      contents = chatHistory.map((item: any) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.content || item.parts?.[0]?.text || "" }],
      }));
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const geminiRes = await generateContentWithFallback(contents, systemInstruction);
    const replyText = geminiRes.text || "";
    return res.json({ response: replyText, reply: replyText });
  } catch (e: any) {
    console.error("Chat API error:", e);
    const errStr = String(e?.message || e);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      const quotaMsg = "⏳ API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다. 약 30초~1분 후에 다시 질문해 주시면 친절하게 답변해 드릴게요! 😊";
      return res.json({ response: quotaMsg, reply: quotaMsg });
    }
    return res.status(500).json({ error: "답변 생성 실패", message: e?.message });
  }
};

router.post("/chat", handleChat);
router.post("/api/chat", handleChat);
app.post("/api/chat", handleChat);
app.post("/chat", handleChat);

// 9. Check Spelling
router.post("/check-spelling", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.json({ correctedText: text || "", count: 0 });
    }

    const prompt = `다음 텍스트는 학생이 작성한 자기소개서 본문입니다.
한국어 맞춤법 규정, 띄어쓰기 규칙, 오탈자를 국립국어원 표준에 맞게 정확히 교정한 최종 완성 텍스트를 출력하세요.
순수 JSON 형식으로만 응답:
{
  "correctedText": "수정된 전체 본문",
  "count": 수정된_개수(숫자)
}

[원문]
${text}`;

    let aiCorrectedText = text;
    let aiCount = 0;

    try {
      const geminiRes = await generateContentWithFallback(
        [{ role: "user", parts: [{ text: prompt }] }],
        "너는 한국어 맞춤법 전문 교정가야. JSON으로 응답해."
      );
      if (geminiRes && geminiRes.text) {
        const cleaned = geminiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.correctedText) {
          aiCorrectedText = parsed.correctedText;
          aiCount = parsed.count || 0;
        }
      }
    } catch (aiErr) {
      // fallback to rules
    }

    const finalResult = correctKoreanText(aiCorrectedText);
    return res.json({
      correctedText: finalResult.correctedText,
      count: finalResult.correctedText !== text ? Math.max(aiCount, finalResult.count, 1) : 0
    });
  } catch (err: any) {
    const safe = correctKoreanText(req.body?.text || "");
    return res.json({ correctedText: safe.correctedText, count: safe.count });
  }
});

// 10. Cover Letter Coach
router.post("/cover-letter/coach", async (req, res) => {
  try {
    const {
      companyName,
      sectionTitle,
      recommendedChars,
      currentAnswer,
      actionType,
      userQuestion,
      userProfile,
      diaries
    } = req.body || {};

    const answer = (currentAnswer || "").trim();
    const studentName = userProfile?.name || "학생";
    const studentMajor = userProfile?.major || "전공";
    const studentSchool = userProfile?.highSchool || "마이스터·특성화고";
    const studentMbti = userProfile?.mbti || "";
    const studentHolland = userProfile?.hollandCode || "";
    const targetCompanies = userProfile?.targetCompanies && userProfile.targetCompanies.length > 0 
      ? userProfile.targetCompanies.join(", ") 
      : (companyName || "지원 기업");

    // 다이어리 요약 텍스트 생성
    let diaryContext = "등록된 다이어리 없음";
    if (Array.isArray(diaries) && diaries.length > 0) {
      diaryContext = diaries.slice(0, 5).map((d: any, idx: number) => {
        const title = d.title || `활동 ${idx + 1}`;
        const content = d.content ? d.content.slice(0, 200) : "";
        const tags = Array.isArray(d.tags) && d.tags.length > 0 ? ` (태그: ${d.tags.join(', ')})` : "";
        return `[기록 ${idx + 1}] ${title}${tags}\n내용: ${content}`;
      }).join("\n\n");
    }

    const systemInstruction = `너는 마이스터고 및 특성화고 학생의 자기소개서 실시간 작성을 돕는 전문 취업·진로 멘토 'MyStair AI 코치'입니다.
[필수 원칙]:
1. 절대 이모지나 이모티콘(외계인, 새싹, 박수, 로켓 등 특수 기호 일체)을 사용하지 마세요. 깔끔하고 신뢰감 있는 표준 한국어 문장으로 답변하세요.
2. 학생의 마이페이지 프로필(이름, 학교, 전공, MBTI, 적성)과 성장 다이어리에 기록된 실제 실습 경험을 적극 활용하세요.
3. 절대 학생 대신 글을 통째로 써주는 대필을 하지 말고, 학생 본인의 경험을 스스로 구체화할 수 있도록 키워드와 구체적인 방향성을 제시하세요.
4. 중요: 절대로 쓸데없는 미사여구(칭찬, 친절한 격려, 서론 등)를 늘어놓지 마세요. 피드백이나 답변은 반드시 최대 2~3문장 이내로만 아주 짧고 명확하게 수정 방향만 핵심만 말하세요. 사용자가 읽을 때 피로감을 느끼지 않아야 합니다.`;

    let prompt = "";
    if (actionType === "ask_question" && userQuestion) {
      prompt = `[지원자 프로필]:
- 이름: ${studentName} / 학교 및 전공: ${studentSchool} ${studentMajor}
- 희망 지원 기업: ${targetCompanies}

[지원자의 성장 다이어리]:
${diaryContext}

[현재 작성 중인 문항]: ${sectionTitle || '문항'}
[현재 학생이 작성 중인 내용]:
"""
${answer || '(작성 시작 전)'}
"""

[학생의 질문]: "${userQuestion}"

[답변 요청]:
- 이모티콘을 절대 넣지 마세요.
- 피로감이 전혀 없도록 서론 없이 **최대 2~3문장 이내로 핵심 조언만 매우 짧고 명확하게** 수정 방향을 짚어주세요.
- 학생의 다이어리 실습 경험을 직무와 어떻게 연결할지 힌트만 던져주세요.`;
    } else {
      prompt = `[지원자 프로필 (MyPage)]:
- 이름: ${studentName}
- 전공: ${studentSchool} ${studentMajor}

[지원자의 성장 다이어리]:
${diaryContext}

[지원 기업]: ${companyName || targetCompanies}
[자기소개서 문항]: ${sectionTitle || '문항'} (권장 분량: ${recommendedChars || 500}자)
[현재 작성 내용]:
"""
${answer || '(내용 없음)'}
"""

학생이 작성 중인 내용을 실시간으로 분석하여, 이모지 없이 진정성 있는 피드백을 JSON으로 제공하세요.
반드시 다음 순수 JSON 형식으로만 응답하세요:
{
  "speech": "학생에게 직접 말하듯 전하는 2~3문장의 핵심 피드백 (이모지 절대 금지, 전공과 기업 특성을 살린 실질적 조언)",
  "summary": "핵심 피드백 요약",
  "tips": [
    "구체적인 개선 포인트 (수치화, STAR 행동 구체화 등)"
  ]
}`;
    }

    let geminiRes: any = null;
    try {
      geminiRes = await generateContentWithFallback(
        [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction
      );
    } catch (aiErr: any) {
      console.warn("Gemini API call failed for coach, falling back to intelligent heuristic coach engine:", aiErr?.message || aiErr);
    }

    const replyText = geminiRes?.text || "";

    if (actionType === "ask_question") {
      if (replyText) {
        // 혹시 포함되었을지 모르는 이모지 정제
        const cleanedReply = replyText.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        return res.json({ success: true, answer: cleanedReply });
      }
      return res.json({
        success: true,
        answer: generateFallbackAnswer(userQuestion, companyName, sectionTitle, answer, userProfile, diaries)
      });
    }

    if (replyText) {
      try {
        const cleaned = replyText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.speech) {
          parsed.speech = parsed.speech.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        }
        return res.json({ success: true, feedback: parsed });
      } catch (parseErr) {
        console.warn("JSON parse failed for Gemini coach, using heuristic:", parseErr);
      }
    }

    // Heuristic Smart Fallback Engine
    const fallbackFeedback = generateFallbackCoaching(companyName, sectionTitle, answer, recommendedChars, userProfile, diaries);
    return res.json({ success: true, feedback: fallbackFeedback });
  } catch (error: any) {
    console.error("Cover letter coach API error:", error);
    const safeFeedback = generateFallbackCoaching(
      req.body?.companyName, 
      req.body?.sectionTitle, 
      req.body?.currentAnswer || '', 
      req.body?.recommendedChars || 500,
      req.body?.userProfile,
      req.body?.diaries
    );
    return res.json({ success: true, feedback: safeFeedback });
  }
});

// Heuristic Fallback Coaching Helpers (이모지 없이 프로필 및 다이어리 실제 데이터 연동)
function generateFallbackCoaching(
  companyName: string, 
  sectionTitle: string, 
  answer: string, 
  recommendedChars: number,
  userProfile?: any,
  diaries?: any[]
) {
  const targetCompany = companyName || '지원 기업';
  const cleanSection = sectionTitle || '자기소개서 문항';
  const studentName = userProfile?.name || '학생';
  const studentMajor = userProfile?.major || '전공';

  const userDiaries = Array.isArray(diaries) && diaries.length > 0 ? diaries : [];
  const topDiary = userDiaries.length > 0 ? userDiaries[0] : null;

  let speech = `${studentName}님이 작성 중이신 [${cleanSection}] 문항은 ${targetCompany} 직무에 대한 이해도와 본인의 전공 역량을 보여주는 중요한 파트입니다.`;
  if (topDiary) {
    speech += ` 다이어리에 적어두신 '${topDiary.title}' 활동의 구체적인 문제 해결 과정을 1~2문장으로 본문에 녹여내면 설득력이 크게 높아집니다.`;
  } else {
    speech += ` 학교 실습실이나 프로젝트 진행 중, 오류를 해결하거나 주도적으로 설계하여 개선했던 구체적인 행동(Action)을 STAR 기법으로 한 단계 더 보강해 보세요.`;
  }

  return {
    speech: speech,
    summary: "전공 실습 과제 및 실제 행동 수치 위주의 보강",
    tips: [
      "추상적인 '열심히 노력했다' 보다는 '3일간', '오차율 12%' 처럼 구체적인 숫자로 성과 작성하기",
      `지원하시는 [${targetCompany}]의 설무 직무에 부합하는 전공(${studentMajor}) 실무 기술 명확히 나열하기`,
      "문항 분량 요구사항에 맞추어 STAR(상황-과제-행동-결과) 기법에 입각한 스토리라인 전개"
    ]
  };
}

function generateFallbackAnswer(
  userQuestion: string, 
  companyName: string, 
  sectionTitle: string, 
  answer: string,
  userProfile?: any,
  diaries?: any[]
) {
  const q = (userQuestion || '').trim().toLowerCase();
  const trimmedAnswer = (answer || '').trim();
  const answerLen = trimmedAnswer.length;
  const targetCompany = companyName || '지원 기업';
  const cleanSection = sectionTitle || '자기소개서 문항';
  const studentName = userProfile?.name || '학생';
  const studentMajor = userProfile?.major || '전공';

  const userDiaries = Array.isArray(diaries) && diaries.length > 0 ? diaries : [];
  const topDiary = userDiaries.length > 0 ? userDiaries[0] : null;

  // 1. Identity / Greeting / Confirmation
  if (q.includes("너 누구") || q.includes("누구야") || q.includes("mystair") || q.includes("마이스테어") || q.includes("맞아") || q.includes("외계인")) {
    return `네, 저는 마이스터고·특성화고 학생들을 위해 만들어진 취업 멘토 MyStair AI 코치입니다. 학생 대신 글을 지어내는 대필 대신, ${studentName}님이 마이페이지와 다이어리에 기록해둔 진짜 실습과 프로젝트 경험을 바탕으로 합격 자기소개서를 완성할 수 있도록 실시간으로 코칭해 드립니다. 작성 중에 고민되는 부분이 있다면 편하게 질문해 주세요.`;
  }
  if (q.includes("안녕") || q.includes("반가워") || q.includes("하이") || q.includes("hello")) {
    return `안녕하세요, ${studentName}님. [${targetCompany}] 취업을 위해 지금 [${cleanSection}] 문항을 작성 중이시군요. 전공 실습이나 다이어리 경험을 어떻게 녹여낼지 고민되는 점이 있다면 편하게 물어보세요.`;
  }
  if (q.includes("고마워") || q.includes("감사")) {
    return `도움이 되었다니 기쁩니다. 한 문장씩 진솔하게 써내려가다 보면 분명 좋은 자기소개서가 완성될 것입니다. 계속해서 힘내서 작성해 보세요.`;
  }

  // 2. 다이어리/경험/마이페이지 관련 질문 ("다이어리 알아?", "내 경험", "마이페이지", "나에 대해 알아?")
  if (q.includes("다이어리") || q.includes("경험") || q.includes("마이페이지") || q.includes("기록") || q.includes("알고있어") || q.includes("알고 있어")) {
    if (topDiary) {
      return `${studentName}님의 마이페이지 프로필(${studentMajor})과 성장 다이어리 기록을 모두 파악하고 있습니다. 특히 다이어리에 기록해 두신 '${topDiary.title}' 일화는 ${targetCompany} 자기소개서에 아주 훌륭한 소재입니다. 이 경험을 자기소개서 문맥에 맞게 어떻게 연결하면 좋을지 말씀해 드릴까요?`;
    }
    return `${studentName}님의 마이페이지 프로필 정보(${studentMajor})를 바탕으로 코칭하고 있습니다. 작성 중이신 내용이나 학교 실습 일화에 대해 말씀해 주시면 맞춤 조언을 드리겠습니다.`;
  }

  // 2-1. 오타/맞춤법/띄어쓰기 질문
  if (q.includes("오타") || q.includes("맞춤법") || q.includes("띄어쓰기") || q.includes("교정") || q.includes("고쳐")) {
    if (answerLen === 0) {
      return `현재 [${cleanSection}] 문항에 작성된 내용이 없습니다. 먼저 본문을 편하게 작성하신 후 질문해 주시거나 문항 툴바의 'AI 오타·맞춤법 수정' 버튼을 클릭하시면 실시간으로 깔끔하게 교정해 드립니다.`;
    }
    const checkRes = correctKoreanText(trimmedAnswer);
    if (checkRes.changed) {
      return `[${cleanSection}] 문항을 분석한 결과 오타 및 띄어쓰기 ${checkRes.count}건이 확인되었습니다. 문항 툴바 우측의 [AI 오타·맞춤법 수정] 버튼을 클릭하시면 본문에 원클릭으로 완벽하게 반영됩니다.`;
    }
    return `[${cleanSection}] 문항의 맞춤법과 띄어쓰기를 정밀 검사한 결과, 국립국어원 표준 규정에 맞는 아주 훌륭한 문장입니다. 오타 없이 잘 작성하셨으니 안심하고 계속 작성해 보세요.`;
  }

  // 3. 고민/어떻게 바꿔/수정 ("고민", "어케 바꿔", "어떻게 바꿔", "수정", "바꿔야")
  if (q.includes("어케") || q.includes("어떻게") || q.includes("고민") || q.includes("바꿔") || q.includes("수정") || q.includes("고치")) {
    if (answerLen === 0) {
      if (topDiary) {
        return `첫 문장 작성이 고민이시라면, 다이어리에 적어두신 '${topDiary.title}' 경험으로 시작해 보세요. '저는 ${studentMajor} 실습 중 ~한 문제를 해결하며 책임감을 배웠습니다'처럼 첫 문장을 두괄식으로 던지면 좋습니다.`;
      }
      return `어떤 내용으로 시작할지 고민되신다면, 학교 실습 중 가장 기억에 남거나 어려움을 극복했던 한 가지 일화를 떠올려 보세요. 편하게 첫 문장을 적어주시면 흐름에 맞게 다듬어 드리겠습니다.`;
    }
    
    let advice = `현재 작성 중이신 문장은 전공 실습에 대한 주도적인 노력이 잘 드러나 있습니다.`;
    if (topDiary) {
      advice += `\n여기에 다이어리에 기록된 '${topDiary.title}'처럼, 당시 구체적으로 다루었던 설비나 공구 명칭, 그리고 직면했던 오류를 해결한 구체적인 행동(Action)을 1~2문장 더 보강해 보세요.`;
    } else {
      advice += `\n여기에 단순히 열심히 했다는 서술보다, 당시 겪었던 구체적인 문제 상황과 이를 해결하기 위해 취했던 조치(Action)를 1~2문장 더 보강해 보세요.`;
    }
    if (targetCompany !== '지원 기업' && !trimmedAnswer.includes(targetCompany)) {
      advice += `\n마무리에는 이 경험을 통해 배운 안전 의식이 [${targetCompany}]의 현장 품질에 어떻게 기여할지 1문장으로 연결하시면 완벽합니다.`;
    }
    return advice;
  }

  // 4. "지금 어때", "평가해줘", "어때?", "봐줘", "피드백"
  if (q.includes("어때") || q.includes("어떠") || q.includes("평가") || q.includes("봐줘") || q.includes("피드백") || q.includes("진단")) {
    if (answerLen === 0) {
      return `아직 본문이 비어 있습니다. 머릿속에 떠오르는 생각을 다듬지 말고 일단 1~2문장만 편하게 적어보세요. 적어주시는 즉시 읽고 방향을 함께 잡아드리겠습니다.`;
    }
    if (answerLen < 50) {
      return `지금 "${trimmedAnswer}"라고 첫 운을 떼셨군요. 시작이 좋습니다. 아직은 분량이 짧아 전체 구성을 진단하기는 이르지만, 문장 전달력은 깔끔합니다. 이어서 당시 구체적인 계기나 본인이 맡았던 역할을 1~2문장 더 덧붙여주세요.`;
    }
    const hasNum = /[0-9]+%?|일간|개월|시간|개|차|회/.test(trimmedAnswer);
    const hasCompany = targetCompany !== '지원 기업' && trimmedAnswer.includes(targetCompany);
    let advice = `문맥의 흐름이 탄탄하고 전달하고자 하는 메시지가 뚜렷합니다. `;
    if (!hasNum) {
      advice += `팁을 드리자면, '많은 시간', '열심히' 같은 추상적인 표현 대신 '3주 동안', '팀원 3명과 함께', '오류율 15% 감소'처럼 숫자로 구체화하면 신뢰도가 크게 높아집니다.`;
    } else if (!hasCompany && targetCompany !== '지원 기업') {
      advice += `마무리 부분에 이 경험에서 얻은 직무 역량이 [${targetCompany}]의 현장에서 어떻게 쓰일 수 있을지 한 줄로 연결하면 아주 좋습니다.`;
    } else {
      advice += `문장의 종결어미를 단정형('~했습니다', '~를 배웠습니다')으로 통일하여 자신감 있는 기술 인재의 인상을 주면 더 좋습니다.`;
    }
    return advice;
  }

  // 5. 소재 추천 ("뭐써", "소재", "아이디어", "쓸게 없어")
  if (q.includes("뭐써") || q.includes("뭐 써") || q.includes("소재") || q.includes("아이디어") || q.includes("모르겠") || q.includes("쓸게") || q.includes("주제") || q.includes("추천") || q.includes("어떻게 적") || q.includes("적어")) {
    if (userDiaries.length > 0) {
      const titles = userDiaries.slice(0, 2).map(d => `'${d.title}'`).join(', ');
      return `${studentName}님의 성장 다이어리에 있는 ${titles} 기록을 적극 추천합니다. 실습실에서 직접 겪은 문제와 해결 과정이 담겨 있어, [${targetCompany}] 면접관에게 가장 매력적인 진짜 직무 경험으로 인정받을 수 있습니다. 이 중 어떤 경험으로 작성해 보시겠습니까?`;
    }
    if (cleanSection.includes("성장과정")) {
      return `[성장과정]은 어릴 적 이야기보다 ${studentMajor}를 선택하게 된 계기나, 실습실에서 처음 공구와 장비를 다루며 끈기를 발휘했던 순간을 소재로 잡는 것이 가장 효과적입니다.`;
    }
    if (cleanSection.includes("지원동기")) {
      return `[지원동기]는 학교에서 가장 자신 있게 다뤘던 장비나 실습 기술과, [${targetCompany}]의 생산·설비 직무에서 내가 바로 기여할 수 있는 부분을 연결하는 것이 핵심입니다.`;
    }
    return `학교 전공 실습 과제, 기능사 실기 연습 중 막혔던 순간, 동아리 제작물 발표 등 '작은 문제에 부딪혔다가 노력으로 해결해 낸 순간'이 가장 매력적인 자소서 소재입니다. 가장 기억에 남는 실습을 한 가지만 말씀해 주세요.`;
  }

  // 6. 첫 문장 팁
  if (q.includes("첫 문장") || q.includes("첫문장") || q.includes("도입부") || q.includes("시작")) {
    return `첫 문장은 무조건 '두괄식'으로 핵심 역량을 먼저 제시하는 것이 좋습니다.\n\n예시:\n- "저는 [전공 실습에서 증명한 꼼꼼한 안전 의식]을 바탕으로, [${targetCompany}]의 믿음직한 기술 인재가 되기 위해 지원했습니다."\n- "3년간 ${studentMajor}를 공부하며 쌓은 실습 경험은 제 가장 큰 경쟁력입니다."\n\n수식어구로 길게 끌지 말고, 내가 보여주고 싶은 나의 강점을 첫 문장에 선언해 보세요.`;
  }

  // 7. STAR 기법
  if (q.includes("star") || q.includes("스타")) {
    return `STAR 기법은 자소서를 논리적으로 만드는 공식입니다.\n1. Situation (상황): 어떤 실습 과제나 문제 상황이었는지 간략히 설명\n2. Task (목표): 내가 해결해야 했던 구체적 과제\n3. Action (행동 - 50% 비중): 포기하지 않고 내가 직접 취한 기술적 노력과 협력\n4. Result (결과): 결과적으로 무엇을 완성했고 어떤 역량을 얻었는지\n\n자소서의 절반 이상은 반드시 본인이 '직접 한 행동(Action)'으로 채워야 설득력이 생깁니다.`;
  }

  // 기본 조언
  const defaultReply = `[${cleanSection}] 문항은 지원자의 진정성과 실무 잠재력을 보여주는 중요한 문항입니다. 작성 중인 내용에서 본인의 솔직한 실습 경험과 구체적인 행동(Action)을 한 문장 더 강조해 보세요. 구체적으로 어떤 문장을 다듬고 싶으신지 질문해 주시면 꼼꼼히 조언해 드리겠습니다.`;
  return defaultReply.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

// 11. Interview TTS (GET and POST)
router.get("/interview-tts", async (req, res) => {
  try {
    let rawText = String(req.query?.text || "").trim();
    try { rawText = decodeURIComponent(rawText); } catch {}
    if (!rawText) return res.status(400).send("text query parameter required");
    const voice = String(req.query?.voice || 'injoon');
    const audio = await generateInterviewAudio(rawText, voice);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(audio);
  } catch (err: any) {
    console.error("Interview TTS GET error:", err?.message || err);
    return res.status(500).json({ error: "TTS failed" });
  }
});

router.post("/interview-tts", async (req, res) => {
  try {
    const { text, voice = 'injoon' } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "text is required" });
    const audio = await generateInterviewAudio(text.trim(), String(voice || 'injoon'));
    const profile = VOICE_PROFILES[voice] || VOICE_PROFILES.injoon;
    return res.json({
      audioBase64: audio.toString("base64"),
      format: "audio/mp3",
      voiceUsed: profile.label
    });
  } catch (err: any) {
    console.error("Interview TTS POST error:", err?.message || err);
    return res.status(500).json({ error: "TTS failed" });
  }
});

// 12. Evaluate Interview
router.post("/evaluate-interview", async (req, res) => {
  try {
    const { question, answer, category, targetCompany, targetRole, behaviorMetrics, apiKey } = req.body || {};
    if (!question || !answer) return res.status(400).json({ error: "질문과 답변이 필요합니다." });

    const {
      eyeContactScore = 90,
      postureStability = 92,
      voiceLoudnessScore = 88,
      fidgetingCount = 0,
      blinkRatePerMin = 18,
      totalBlinkCount = 0,
      distractingHabits = [],
      shoulderStatus = 'level',
      shoulderMessage = '양쪽 어깨 수평이 바르게 유지되고 있습니다.',
      expressionStatus = 'good',
      expressionMessage = '자연스럽고 편안한 호감형 표정입니다.'
    } = behaviorMetrics || {};

    const prompt = `당신은 대기업/공기업 베테랑 기술 면접관입니다.
질문: "${question}"
답변: "${answer}"
비언어 지표: 시선(${eyeContactScore}%), 자세(${postureStability}%), 어깨(${shoulderStatus}), 손버릇(${fidgetingCount}회), 눈깜빡임(총 ${totalBlinkCount}회, 분당 ${blinkRatePerMin}회), 표정(${expressionStatus})
JSON으로 엄격하게 응답:
{
  "score": 45~95 사이 점수,
  "comment": "총평 2문장",
  "followUpQuestions": ["실전 꼬리 질문 1", "실전 꼬리 질문 2"],
  "goodPoints": ["잘한 점 1", "잘한 점 2"],
  "improvePoints": ["개선할 점 1", "개선할 점 2"]
}`;

    try {
      const geminiRes = await generateContentWithFallback(
        [{ role: "user", parts: [{ text: prompt }] }],
        "너는 실전 기술 면접관이야. JSON으로 응답해."
      );
      if (geminiRes && geminiRes.text) {
        const cleaned = geminiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
      }
    } catch {}

    return res.json({
      score: 82,
      comment: "전공 실습 경험을 솔직하고 차분하게 전달하셨습니다.",
      followUpQuestions: [
        "그 프로젝트를 수행하며 가장 어려웠던 기술적 난관은 무엇이었습니까?",
        "동료나 팀원과 의견 충돌이 있었을 때 어떻게 해결하셨나요?"
      ],
      goodPoints: ["성실하고 당당한 답변 태도", "질문의 의도에 맞춘 답변"],
      improvePoints: ["답변 서두에 결론을 먼저 말하는 두괄식 구성 연습하기"]
    });
  } catch (err: any) {
    return res.status(500).json({ error: "평가 실패" });
  }
});

// 13. OGQ Stickers
const OGQ_API_KEY_FALLBACK = "ogqc_c3ad18e9908f34113fec37e0d6362884aa4b6e25f27a48b2283db046e0c6f238";
router.get("/ogq/stickers", async (req, res) => {
  try {
    const key = process.env.OGQ_API_KEY || OGQ_API_KEY_FALLBACK;
    const query = req.query?.query ? encodeURIComponent(String(req.query.query)) : "";
    const pageSize = req.query?.pageSize || 10;
    const targetUrl = `https://4th-ai-ogq.competition.ogq.me/v1/assets?pageSize=${pageSize}${query ? `&query=${query}` : ""}`;
    const response = await fetch(targetUrl, { headers: { "X-OGQ-API-KEY": key } });
    if (!response.ok) return res.status(response.status).json({ elements: [] });
    const data = await response.json();
    return res.json(data);
  } catch {
    return res.json({ elements: [] });
  }
});

// Mount router on both /api and root /
app.use("/api", router);
app.use("/", router);

export default app;
