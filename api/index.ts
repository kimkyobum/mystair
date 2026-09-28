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
    const { companyName, sectionTitle, recommendedChars, currentAnswer, actionType, userQuestion, userProfile, diaries } = req.body || {};
    const answer = (currentAnswer || "").trim();
    const studentName = userProfile?.name || "학생";
    const studentMajor = userProfile?.major || "전공";
    const targetCompany = companyName || "지원 기업";

    const systemInstruction = `너는 마이스터고·특성화고 학생의 자기소개서 실시간 작성을 돕는 전문 멘토 MyStair AI 코치입니다.
절대 이모지나 이모티콘을 사용하지 마세요. 깔끔하고 신뢰감 있는 표준 한국어 문장으로 답변하세요.`;

    let prompt = "";
    if (actionType === "ask_question" && userQuestion) {
      prompt = `학생 질문: "${userQuestion}"\n작성 중인 내용:\n${answer}\n이모지 없이 2~3문장으로 명확히 조언하세요.`;
    } else {
      prompt = `작성 중인 자기소개서 내용:\n${answer}\n이모지 없이 다음 JSON으로만 응답:\n{"speech": "2~3문장 핵심 피드백", "summary": "피드백 요약", "tips": ["개선점"]}`;
    }

    try {
      const geminiRes = await generateContentWithFallback([{ role: "user", parts: [{ text: prompt }] }], systemInstruction);
      if (geminiRes && geminiRes.text) {
        if (actionType === "ask_question") {
          return res.json({ success: true, answer: geminiRes.text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() });
        }
        const cleaned = geminiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, feedback: parsed });
      }
    } catch {}

    const feedback = {
      speech: `${targetCompany}에 지원하는 ${studentMajor} 인재로서의 강점을 보여주는 좋은 출발입니다. 전공 실습 경험에서 본인이 직접 겪었던 구체적 문제 해결 과정을 숫자를 섞어 한두 문장 더 보완해 보세요.`,
      summary: "전공 실습의 구체적 성과와 행동을 추가해 보세요.",
      tips: ["추상적인 표현 대신 기간이나 오차율 개선 등의 수치 추가하기"]
    };
    return res.json({ success: true, feedback });
  } catch (e: any) {
    return res.json({
      success: true,
      feedback: { speech: "한 문장씩 차분히 작성해 보세요.", summary: "차분한 작성", tips: ["문장을 명확하게 완성하기"] }
    });
  }
});

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
