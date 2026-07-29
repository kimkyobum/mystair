import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

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
    throw new Error("Gemini API 키가 설정되지 않았습니다. Vercel 환경 변수를 설정해주세요.");
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

// Vercel Serverless Function handler for /api/chat
export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { message, chatHistory, userProfile, diaries } = body;

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

    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
너는 대한민국 대표 공공 및 민간 취업/진로 포털 데이터에 기반한 최고 수준의 도메인 지식을 갖추고 있어.

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
    return res.status(200).json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    const errStr = String(error?.message || error);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      return res.status(200).json({
        response: "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 친절하게 답변해 드릴게요! 😊"
      });
    }
    return res.status(500).json({
      error: "AI 대화 도중 오류가 발생했습니다.",
      details: error?.message || String(error),
    });
  }
}
