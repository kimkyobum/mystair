import { GoogleGenAI } from "@google/genai";
import { correctKoreanText } from "../src/utils/koreanSpellChecker";

// Robust Gemini content generation with key rotation & fallback
async function generateContentWithFallback(contents: any[], systemInstruction: string): Promise<any> {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.VITE_GEMINI_API_KEY
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
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }

  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash"
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
            temperature: 0.1,
          },
        });

        return response;
      } catch (error: any) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error("모든 설정된 Gemini API 키와 모델이 응답 생성에 실패했습니다.");
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(200).json({ correctedText: text || "", count: 0 });
    }

    // 1단계: Gemini AI 기반 국립국어원 표준 맞춤법 및 오탈자 정밀 교정
    const prompt = `다음 텍스트는 학생이 작성한 자기소개서 본문입니다.
한국어 맞춤법 규정, 띄어쓰기 규칙, 오탈자(예: 됬->됐, 되서->돼서, 안되->안 돼, 않되->안 돼, 됫->됐, 준구난방->중구난방 등), 잘못된 조사/어미를 국립국어원 표준에 맞게 정확히 교정한 최종 완성 텍스트를 출력하세요.

반드시 원문의 원래 내용, 문장의 의미, 어조는 그대로 유지하면서 오직 "오타, 맞춤법, 띄어쓰기"만 바르게 교정해야 합니다.
절대로 새로운 내용을 지어내거나 멋대로 문맥을 바꾸지 마세요.

반드시 순수한 JSON 형식으로만 응답하세요:
{
  "correctedText": "오타와 띄어쓰기가 완벽하게 수정된 전체 본문 텍스트",
  "count": 수정된_오타_및_띄어쓰기_개수(숫자)
}

[검사 및 수정할 원문 텍스트]
${text}
`;

    const systemInstruction = "너는 한국어 맞춤법 및 국립국어원 표준 규정에 정통한 전문 교정 전문가입니다. 원문의 의미와 문맥을 보존하며 오타, 띄어쓰기, 맞춤법만 완벽하게 수정한 결과를 JSON으로 반환합니다.";

    let aiCorrectedText = text;
    let aiCount = 0;

    try {
      const geminiRes = await generateContentWithFallback(
        [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction
      );

      if (geminiRes && geminiRes.text) {
        const cleaned = geminiRes.text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        if (parsed.correctedText && typeof parsed.correctedText === "string") {
          aiCorrectedText = parsed.correctedText;
          if (typeof parsed.count === "number") {
            aiCount = parsed.count;
          }
        }
      }
    } catch (aiErr) {
      console.warn("Gemini spell check in serverless failed, continuing to rules engine:", aiErr);
    }

    // 2단계: 한국어 음운 분해 및 규칙 엔진 교정
    const finalResult = correctKoreanText(aiCorrectedText);

    return res.status(200).json({
      correctedText: finalResult.correctedText,
      count: finalResult.correctedText !== text ? Math.max(aiCount, finalResult.count, 1) : 0
    });
  } catch (err: any) {
    console.error("Error in serverless /api/check-spelling:", err);
    const safeFallback = correctKoreanText(req.body?.text || "");
    return res.status(200).json({
      correctedText: safeFallback.correctedText,
      count: safeFallback.count
    });
  }
}
