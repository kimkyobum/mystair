import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize PostgreSQL connection if DATABASE_URL is available
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com") 
    ? { rejectUnauthorized: false } 
    : undefined
});

if (process.env.DATABASE_URL) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      uid VARCHAR(255) PRIMARY KEY,
      profile_data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_diaries (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      date VARCHAR(20) NOT NULL,
      mood VARCHAR(50),
      tags JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).then(() => {
    console.log("PostgreSQL Database tables verified/created.");
  }).catch(err => {
    console.error("Error creating PostgreSQL tables:", err);
  });
}

// Robust Gemini content generation with key rotation & fallback
async function generateContentWithFallback(contents: any[], systemInstruction: string): Promise<any> {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.VITE_GEMINI_API_KEY
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 환경 변수를 설정해주세요.");
  }

  // Choose a random starting key to distribute traffic, then rotate through the rest as fallback on error (like 429)
  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  // We rotate through multiple valid Gemini models to avoid single-model free-tier limits (e.g. 20 req/day for 3.6-flash)
  const fallbackModels = [
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-latest"
  ];

  for (const modelName of fallbackModels) {
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
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        console.log(`Successfully generated content using ${keyName} with model ${modelName}`);
        return response;
      } catch (error: any) {
        console.warn(`[Gemini API Warning] ${keyName} failed with model ${modelName}. Error: ${error?.message || error}. Trying next...`);
        lastError = error;
      }
    }
  }

  throw lastError || new Error("모든 설정된 Gemini API 키와 모델이 응답 생성에 실패했습니다.");
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

  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query('SELECT profile_data FROM user_profiles WHERE uid = $1', [userId]);
      if (result.rows.length > 0) {
        return res.json({ status: "success", userId, profile: result.rows[0].profile_data });
      } else {
        return res.json({ status: "success", userId, profile: null });
      }
    } catch (e) {
      console.warn("PostgreSQL profile fetch error, using fallback DB:", e);
    }
  }

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

  if (process.env.DATABASE_URL) {
    try {
      const profileData = { ...profile, uid: targetUid };
      await pool.query(
        `INSERT INTO user_profiles (uid, profile_data, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (uid) DO UPDATE 
         SET profile_data = EXCLUDED.profile_data, updated_at = CURRENT_TIMESTAMP`,
        [targetUid, JSON.stringify(profileData)]
      );
      return res.json({ status: "success", userId: targetUid, profile: profileData });
    } catch (e) {
      console.warn("PostgreSQL profile save error, using fallback DB:", e);
    }
  }

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

  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query('SELECT * FROM user_diaries WHERE user_id = $1 ORDER BY date DESC, created_at DESC', [userId]);
      const diaries = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        date: row.date,
        mood: row.mood,
        tags: row.tags,
        createdAt: row.created_at
      }));
      return res.json({ status: "success", userId, diaries });
    } catch (e) {
      console.warn("PostgreSQL diaries fetch error, using fallback DB:", e);
    }
  }

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

  if (process.env.DATABASE_URL) {
    try {
      await pool.query(
        `INSERT INTO user_diaries (id, user_id, title, content, date, mood, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, content = EXCLUDED.content, date = EXCLUDED.date, mood = EXCLUDED.mood, tags = EXCLUDED.tags`,
        [diary.id, targetUid, diary.title, diary.content, diary.date, diary.mood, JSON.stringify(diary.tags || [])]
      );
      return res.json({ status: "success", userId: targetUid, diary });
    } catch (e) {
      console.warn("PostgreSQL diary save error, using fallback DB:", e);
    }
  }

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

  if (process.env.DATABASE_URL) {
    try {
      await pool.query('DELETE FROM user_diaries WHERE id = $1 AND user_id = $2', [diaryId, userId]);
      return res.json({ status: "success", message: "Diary deleted successfully" });
    } catch (e) {
      console.warn("PostgreSQL diary delete error, using fallback DB:", e);
    }
  }

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
   - **반드시 2줄 이내로 매우 짧고 간결하게 대답해!**
   - 길게 설명하지 말고, 친근하게 인사하며 도움이 필요한 점이 있는지 물어봐.

2. 🌿 **단일 주제 질문 및 가벼운 진로 질문** (예: "전기기능사 시험 난이도 어때?", "자소서 작성 팁 알려줘"):
   - **2~3줄 이내로 핵심만 짧고 명쾌하게 가이드를 제공해.**

3. 🎯 **진로와 관련된 진지하고 많은 내용이 필요한 종합 컨설팅 질문** (예: "내 프로필과 다이어리 기반 종합 진로 리포트 써줘", "나한테 맞는 기업, 자격증, 액션플랜 전체 분석해줘"):
   - **5줄에서 10줄 정도로 상세하게 답변해줘.**
   - 가독성을 위해 마크다운과 이모지를 적절히 사용하되, 너무 길어지지 않게 10줄을 넘기지 않도록 요약해서 답변해줘.

위 규칙을 엄격하게 지켜서 답변 길이를 조절해줘.
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
