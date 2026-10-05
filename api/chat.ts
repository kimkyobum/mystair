import { GoogleGenAI } from "@google/genai";

// Universal CORS handler
function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key, Authorization"
  );
}

// Fallback models in priority order
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite"
];

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({ status: "ok", message: "MyStair Chat API endpoint is active." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        // ignore
      }
    }

    const { message, chatHistory, userProfile, diaries, language = "ko" } = body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "질문 내용이 없습니다." });
    }

    // Collect all possible keys from environment variables and headers
    const clientHeaderKey = req.headers["x-gemini-api-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    const rawKeys = [
      clientHeaderKey,
      process.env.GEMINI_API_KEY,
      process.env.VITE_GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3,
      process.env.GEMINI_API_KEY4,
      process.env.GEMINI_API_KEY5,
      process.env.VITE_GEMINI_API_KEY2,
      process.env.VITE_GEMINI_API_KEY3,
      process.env.VITE_GEMINI_API_KEY4,
      process.env.GOOGLE_API_KEY,
      process.env.API_KEY,
    ];

    // Flatten keys if separated by comma, space, or newline
    const expandedKeys: string[] = [];
    for (const item of rawKeys) {
      if (typeof item === "string" && item.trim()) {
        const split = item.split(/[\s,;\n]+/).filter(Boolean);
        expandedKeys.push(...split);
      }
    }

    const validKeys = Array.from(new Set(expandedKeys)).filter((k): k is string => {
      if (!k || typeof k !== "string") return false;
      const trimmed = k.trim();
      const lower = trimmed.toLowerCase();
      return (
        trimmed !== "" &&
        trimmed.length > 5 &&
        lower !== "my_gemini_api_key" &&
        lower !== "your_api_key" &&
        lower !== "your_gemini_api_key" &&
        lower !== "null" &&
        lower !== "undefined" &&
        lower !== "placeholder"
      );
    });

    if (validKeys.length === 0) {
      return res.status(500).json({
        error: "NO_API_KEY",
        message: "Vercel 환경 변수(Environment Variables)에 GEMINI_API_KEY 또는 VITE_GEMINI_API_KEY가 등록되지 않았거나 Redeploy가 필요합니다.",
        hint: "Vercel Project Settings > Environment Variables에 등록 후, Deployments 탭에서 Redeploy를 실행해주세요."
      });
    }

    // Calculate real-time Korean Standard Time
    const now = new Date();
    const fullFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    });
    const isoFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = isoFormatter.formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value || String(now.getFullYear());
    const m = parts.find((p) => p.type === "month")?.value || String(now.getMonth() + 1).padStart(2, "0");
    const d = parts.find((p) => p.type === "day")?.value || String(now.getDate()).padStart(2, "0");
    const currentDateISO = `${y}-${m}-${d}`;
    const currentDateString = fullFormatter.format(now);

    const profileText = userProfile
      ? `[사용자 프로필]\n- 이름: ${userProfile.name || "미입력"}\n- 학교/전공: ${userProfile.highSchool || "미입력"} / ${userProfile.major || "미입력"}\n- MBTI: ${userProfile.mbti || "미진단"}\n- 홀랜드 코드: ${userProfile.hollandCode || "미진단"}\n- 관심 기업: ${Array.isArray(userProfile.targetCompanies) ? userProfile.targetCompanies.join(", ") : "미지정"}`
      : "[사용자 프로필 미입력]";

    const diariesText = Array.isArray(diaries) && diaries.length > 0
      ? `[작성한 성장 다이어리 (${diaries.length}건)]\n${diaries.slice(0, 10).map((item: any, idx: number) => `[다이어리 #${idx + 1}] 날짜: ${item.date || ""}, 제목: ${item.title || ""}, 내용: ${item.content || ""}`).join("\n")}`
      : "[성장 다이어리 기록 없음]";

    const baseInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
[현재 실시간 시스템 날짜 (절대적 기준)]
- 오늘 날짜: ${currentDateString} (${currentDateISO})

[답변 원칙]
1. 오늘 날짜 질문에는 반드시 위의 실시간 오늘 날짜(${currentDateString})를 정확히 알려줘.
2. 일상 인사나 단순 질문은 2줄 이내로 매우 짧고 친근하게 답해.
3. 단일 주제 진로 질문은 2~3줄로 명쾌하게 핵심만 알려줘.
4. 종합 리포트나 분석 요청은 5~10줄 내외로 가독성 있게 요약해줘.
5. 학생의 실제 경험에 충실하고 없는 사실을 지어내지 마.

${profileText}

${diariesText}
`;

    let finalInstruction = baseInstruction;
    if (language === "en") {
      finalInstruction += "\n[LANGUAGE REQUIREMENT]\nThe user interface language is English ('en'). Please respond entirely in clear, supportive English.\n";
    } else {
      finalInstruction += "\n[LANGUAGE REQUIREMENT]\n사용자 언어는 한국어('ko')입니다. 반드시 자연스럽고 친절한 한국어로 답변해주세요.\n";
    }

    // Format chat history
    let contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const recent = chatHistory.slice(-8);
      for (const item of recent) {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.content || item.parts?.[0]?.text || "" }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Rotation across keys and models
    let lastError: any = null;
    const startIndex = Math.floor(Math.random() * validKeys.length);

    for (const modelName of FALLBACK_MODELS) {
      for (let i = 0; i < validKeys.length; i++) {
        const keyIdx = (startIndex + i) % validKeys.length;
        const apiKey = validKeys[keyIdx];

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
              systemInstruction: finalInstruction,
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          });

          const replyText = response.text || (language === "en" ? "Failed to generate response." : "답변을 생성하지 못했습니다.");
          return res.status(200).json({
            response: replyText,
            reply: replyText,
            modelUsed: modelName,
            status: "success"
          });
        } catch (callErr: any) {
          console.warn(`Key index ${keyIdx} failed with model ${modelName}:`, callErr?.message || callErr);
          lastError = callErr;
        }
      }
    }

    const errStr = String(lastError?.message || lastError);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      const quotaMsg = language === "en"
        ? "⏳ **The API usage has temporarily reached its limit.** Please try again in about 30 seconds to 1 minute! 😊"
        : "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.** 약 30초~1분 후에 다시 질문해 주시면 친절하게 답변해 드릴게요! 😊";
      return res.status(200).json({
        response: quotaMsg,
        reply: quotaMsg,
        quotaExceeded: true
      });
    }

    return res.status(500).json({
      error: "GENERATION_FAILED",
      message: errStr,
      details: "All Gemini models and API keys failed."
    });
  } catch (err: any) {
    console.error("Unhandled error in /api/chat:", err);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: err?.message || String(err)
    });
  }
}
