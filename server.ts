import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Robust Gemini content generation with key rotation & fallback
async function generateContentWithFallback(contents: any[], systemInstruction: string): Promise<any> {
  const keys = [
    process.env.VITE_GEMINI_API_KEY2,
    process.env.VITE_GEMINI_API_KEY3,
    process.env.VITE_GEMINI_API_KEY4,
    process.env.VITE_GEMINI_API_KEY
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 환경 변수를 설정해주세요.");
  }

  // Choose a random starting key to distribute traffic, then rotate through the rest as fallback on error (like 429)
  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const keyIndex = (startIndex + i) % keys.length;
    const apiKey = keys[keyIndex];
    const keyName = apiKey === process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" :
                    apiKey === process.env.GEMINI_API_KEY2 ? "GEMINI_API_KEY2" :
                    apiKey === process.env.GEMINI_API_KEY3 ? "GEMINI_API_KEY3" :
                    apiKey === process.env.GEMINI_API_KEY4 ? "GEMINI_API_KEY4" : "VITE_GEMINI_API_KEY";

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
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      console.log(`Successfully generated content using ${keyName}`);
      return response;
    } catch (error: any) {
      console.warn(`[Gemini API Warning] ${keyName} failed. Error: ${error?.message || error}. Trying next key...`);
      lastError = error;
    }
  }

  throw lastError || new Error("모든 설정된 Gemini API 키가 응답 생성에 실패했습니다.");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MyStair AI Assistant Server" });
});

// In-Memory Database Storage for Profiles & Diaries (Syncable with external Render DB)
const userProfilesDb: Record<string, any> = {};
const userDiariesDb: Record<string, any[]> = {};

// Helper to proxy requests to Render Backend if RENDER_BACKEND_URL is set
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || process.env.RENDER_API_URL;

// 1. User Profile API Endpoints
app.get("/api/profile", async (req, res) => {
  const userId = (req.query.userId as string) || "default_user";

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/profile?userId=${encodeURIComponent(userId)}`);
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for profile, using fallback DB:", e);
    }
  }

  const profile = userProfilesDb[userId] || null;
  return res.json({ status: "success", userId, profile });
});

app.post("/api/profile", async (req, res) => {
  const { userId, profile } = req.body;
  const targetUid = userId || profile?.uid || "default_user";

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUid, profile })
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for saving profile, using fallback DB:", e);
    }
  }

  userProfilesDb[targetUid] = {
    ...profile,
    uid: targetUid,
    updatedAt: new Date().toISOString()
  };

  return res.json({ status: "success", userId: targetUid, profile: userProfilesDb[targetUid] });
});

// 2. User Growth Diary API Endpoints
app.get("/api/diaries", async (req, res) => {
  const userId = (req.query.userId as string) || "default_user";

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries?userId=${encodeURIComponent(userId)}`);
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for fetching diaries, using fallback DB:", e);
    }
  }

  const diaries = userDiariesDb[userId] || [];
  return res.json({ status: "success", userId, diaries });
});

app.post("/api/diaries", async (req, res) => {
  const { userId, diary } = req.body;
  const targetUid = userId || diary?.userId || "default_user";

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUid, diary })
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for adding diary, using fallback DB:", e);
    }
  }

  if (!userDiariesDb[targetUid]) {
    userDiariesDb[targetUid] = [];
  }

  const existingIndex = userDiariesDb[targetUid].findIndex(d => d.id === diary.id);
  if (existingIndex >= 0) {
    userDiariesDb[targetUid][existingIndex] = diary;
  } else {
    userDiariesDb[targetUid].unshift(diary);
  }

  return res.json({ status: "success", userId: targetUid, diary });
});

app.delete("/api/diaries/:id", async (req, res) => {
  const diaryId = req.params.id;
  const userId = (req.query.userId as string) || "default_user";

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries/${encodeURIComponent(diaryId)}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE"
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for deleting diary:", e);
    }
  }

  if (userDiariesDb[userId]) {
    userDiariesDb[userId] = userDiariesDb[userId].filter(d => d.id !== diaryId);
  }

  return res.json({ status: "success", message: "Diary deleted successfully" });
});

// Main AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, userProfile, diaries } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "질문 내용이 없습니다." });
    }

    // Format student's user profile
    const profileText = userProfile
      ? `
[사용자 프로필 데이터]
- 이름: ${userProfile.name || "미설정"}
- 학교 및 전공: ${userProfile.highSchool || "마이스터고"} / ${userProfile.major || "전공학과"}
- MBTI 성격유형: ${userProfile.mbti || "미진단"}
- 홀랜드 진로적성: ${userProfile.hollandCode || "미진단"}
- 희망/관심 기업: ${
          Array.isArray(userProfile.targetCompanies) && userProfile.targetCompanies.length > 0
            ? userProfile.targetCompanies.join(", ")
            : "삼성전자, 한국전력공사, 현대자동차, 한화시스템"
        }
`
      : "[사용자 프로필 미입력 - 마이스터고/특성화고 표준 모범 프로필 기준으로 맞춤 응답]";

    // Format student's growth diary entries
    const diariesText =
      Array.isArray(diaries) && diaries.length > 0
        ? `
[사용자가 작성한 성장 다이어리 데이터 (${diaries.length}건)]
${diaries
  .slice(0, 10)
  .map(
    (d: any, i: number) => `
[다이어리 #${i + 1}]
- 작성일: ${d.date || "날짜미상"}
- 제목: ${d.title || "제목없음"}
- 태그: ${Array.isArray(d.tags) ? d.tags.join(", ") : "없음"}
- 기분/상태: ${d.mood || "보통"}
- 기록 내용:
${d.content || ""}
`
  )
  .join("\n-------------------\n")}
`
        : "[성장 다이어리 기록 없음 - 자소서 작성 팁 및 예시 경험 작성 가이드 제공]";

    // System instruction embedding portal domain knowledge & smart conversational handling
    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 AI 진로·취업 수석 컨설턴트이자 다정한 진로 멘토 'MyStair AI'야.

[중요 응답 규칙 - 질문 유형별 답변 분량 및 스타일]
1. 💬 **일상 대화 / 인사 / 단순 질문 / 가벼운 소통** ("안녕?", "반가워", "너 누구야?", "고마워", "오늘 어때?" 등):
   - **절대 길게 말하지 말고 1~2문장 이내로 아주 짧고 간결하게 대답해!**
   - 친근하고 반갑게 인사를 건네며 진로나 취업 관련 도움이 필요할 때 알려달라고 편하게 대화해.
   - 예시: "안녕하세요! 👋 반가워요. 오늘 어떤 이야기나 진로 고민이 있으신가요? 편하게 말씀해 주세요! 😊"

2. 🌿 **단일 주제 질문** (예: "전기기능사 시험 난이도 어때?", "자소서 작성 팁 알려줘", "삼성전자 직무 추천해줘" 등):
   - 거창한 5단계 전체 리포트 대신, **물어본 핵심 주제에 대해서만 2~4문장으로 짧고 명쾌하게 가이드를 제공**해.

3. 🎯 **종합 진로/취업 컨설팅 요청** (예: "내 프로필과 다이어리 기반 종합 진로 리포트 써줘", "나한테 맞는 기업, 자격증, 액션플랜 전체 분석해줘" 등 진지한 전체 컨설팅 요청):
   - 제공된 [사용자 프로필]과 [성장 다이어리]를 종합 분석하여 아래 5가지 필수 구조와 깔끔한 마크다운(#, ##, -, **강조**), 이모지로 정성껏 보고서를 작성해줘:
     1. 🎯 **맞춤 추천 직무**
     2. 🏢 **취업 가능 추천 기업**
     3. ⚡ **더 갖추어야 할 직무 역량**
     4. 📖 **성장다이어리 경험 추출**
     5. 💡 **MyStair 맞춤형 취업 Action Plan**

진지한 전체 컨설팅 요청이 아니라면, 무조건 대답 길이를 획기적으로 줄여서 핵심만 짧고 다정하게 대답해줘.
`;

    // Prepare chat history if present
    let contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      contents = chatHistory.map((item: any) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.content || item.parts?.[0]?.text || "" }],
      }));
      contents.push({
        role: "user",
        parts: [
          {
            text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${message}`,
          },
        ],
      });
    } else {
      contents = [
        {
          role: "user",
          parts: [
            {
              text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${message}`,
            },
          ],
        },
      ];
    }

    const response = await generateContentWithFallback(contents, systemInstruction);

    const replyText = response.text || "답변을 생성하지 못했습니다. 다시 시도해주세요.";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    const errStr = String(error?.message || error);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      return res.json({
        response: "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 친절하게 답변해 드릴게요! 😊"
      });
    }
    return res.status(500).json({
      error: "AI 대화 도중 오류가 발생했습니다.",
      details: error?.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MyStair Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
