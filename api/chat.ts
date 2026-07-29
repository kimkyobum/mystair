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
너는 대한민국 대표 공공 및 민간 취업/진로 포털 데이터에 기반한 최고 수준의 도메인 지식을 갖추고 있어:
1. 공공데이터포털 하이파이브 (Hi-Five: 직업계고 특화 채용, 산학일체형 도템, 현장실습)
2. 마이스터넷 (MeisterNet: 산업맞춤형 마이스터고 육성 및 기업 연계 취업 DB)
3. 커리어넷 (CareerNet: 직업학과 정보, 적성검사 분석, 진로상담)
4. 대입정보포털 어디가 (adiga: 선취업 후진학, 계약학과, 일학습병행제)
5. 공공기관 채용정보시스템 잡알리오 (JOBALIO: 한국전력, 한수원 등 공기업 채용요건)
6. 공공데이터포털 (DATA.GO.KR: 국가기술자격증 정보, 산업별 인력 수요)
7. 잡코리아 (JobKorea: 주요 대기업/중견기업/IT기업 직무기술서(JD) 및 우대 스킬)

[너의 핵심 역할과 출력 가이드]
사용자가 입력창에 물어본 질문: "${message}"

제공된 [사용자 DB 프로필 데이터]와 [성장 다이어리 데이터]를 종합 분석하고, 위 공공/민간 포털 사이트들의 실제 채용 데이터와 자격증 기준을 조합하여
반드시 깔끔하고 보기 쉬운 마크다운(#, ##, ###, -, **강조** 등)과 직관적인 이모지를 사용하여 아래 5가지 필수 구조로 정성껏 대답해줘:

1. 🎯 **맞춤 추천 직무 (Job Roles)**
   - 학생의 전공, MBTI, 홀랜드 적성 및 다이어리 성향에 100% 매칭되는 구체적인 직무(예: PLC 제어 엔지니어, 로봇 소프트웨어 개발자, 전력 설비 운용 등) 2~3개 추천 및 이유 설명.

2. 🏢 **취업 가능 추천 기업 (Target Companies)**
   - 공기업/공공기관 (잡알리오 데이터 기준)
   - 주요 대기업/중견기업 (잡코리아/마이스터넷 데이터 기준)
   - 마이스터고 지정 우수 강소/IT 기업 (하이파이브 데이터 기준)

3. ⚡ **더 갖추어야 할 직무 역량 (Required Skill Enhancements)**
   - **하드 스킬 (Hard Skills)**:
     * 꼭 취득해야 할 국가기술자격증 (Q-Net 기준, 예: 정보처리기능사/기사, 전기기능사/기사, 생산자동화기능사 등)
     * 실무 필수 기술 스택 (예: C/C++, Python, PLC 제어, CAD, 시퀀스 회로, ROS, Linux 등)
   - **소프트 스킬 (Soft Skills)**:
     * 현장실습 및 기업 적응에 필요한 핵심 역량 (예: 현장 안전의식, 문제해결력, 팀원과의 협동심, 문서화 능력 등)

4. 📖 **성장다이어리 경험 추출 (자기소개서/면접 맞춤 활용)**
   - 사용자가 작성한 다이어리 기록 중, 해당 추천 기업에 지원할 때 자기소개서 지원동기/성공경험/문제해결 에피소드나 면접에서 바로 활용할 수 있는 특정 일기(프로젝트/실습/학습 경험)를 직접 찝어서 추출해주고 활용 가이드 제시!
   - (만약 다이어리 기록이 없거나 부족하다면, 지금 어떤 내용으로 다이어리를 작성하면 자소서에 도움이 될지 구체적 예시 작성법 가이드)

5. 💡 **MyStair 맞춤형 취업 Action Plan**
   - 지금 당장 실행해야 할 단기/중기 로드맵 (하이파이브/마이스터넷/커리어넷 연계).

친절하고 따뜻하며, 학생에게 커다란 동기부여와 실질적인 도움을 주는 전문적인 한국어로 응답해줘.
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
