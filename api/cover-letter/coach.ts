import { GoogleGenAI } from "@google/genai";

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
    throw new Error("Gemini API key is not configured.");
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
    const {
      companyName,
      sectionTitle,
      recommendedChars,
      currentAnswer,
      actionType,
      userQuestion,
      userProfile,
      diaries
    } = body;

    const answer = (currentAnswer || "").trim();
    const studentName = userProfile?.name || "학생";
    const studentMajor = userProfile?.major || "전공";
    const studentSchool = userProfile?.highSchool || "마이스터·특성화고";
    const studentMbti = userProfile?.mbti || "";
    const studentHolland = userProfile?.hollandCode || "";
    const targetCompanies = userProfile?.targetCompanies && userProfile.targetCompanies.length > 0 
      ? userProfile.targetCompanies.join(", ") 
      : (companyName || "지원 기업");

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
1. 절대 이모지나 이모티콘을 사용하지 마세요. 깔끔하고 신뢰감 있는 표준 한국어 문장으로 답변하세요.
2. 학생의 마이페이지 프로필(이름, 학교, 전공, MBTI, 적성)과 성장 다이어리에 기록된 실제 실습 과제, 기능사 자격증, 프로젝트 일화를 적극적으로 파악하고 있어야 합니다.
3. 질문을 받거나 조언을 할 때, 학생이 다이어리에 적어둔 실제 경험을 구체적으로 인용하며 [${companyName || targetCompanies}]의 직무와 연결해 주세요.
4. 절대 학생 대신 글을 통째로 써주는 대필을 하지 말고, 학생 본인의 경험을 스스로 구체화할 수 있도록 키워드, 구조(STAR 기법), 구체적인 방향성을 제시하세요.
5. 어조는 차분하고 정중한 존댓말로, 1~3문단 내외로 간결하고 핵심만 전달하세요.`;

    let prompt = "";
    if (actionType === "ask_question" && userQuestion) {
      prompt = `[지원자 프로필 (MyPage)]:
- 이름: ${studentName}
- 학교 및 전공: ${studentSchool} ${studentMajor}
- 직업적성: MBTI ${studentMbti || '미설정'}, Holland ${studentHolland || '미설정'}
- 희망 지원 기업: ${targetCompanies}

[지원자의 성장 다이어리 (실제 경험 기록)]:
${diaryContext}

[현재 지원 기업]: ${companyName || targetCompanies}
[작성 중인 자기소개서 문항]: ${sectionTitle || '문항'} (권장 분량: ${recommendedChars || 500}자)
[현재 학생이 작성 중인 내용]:
"""
${answer || '(작성 시작 전)'}
"""

[학생의 질문]: "${userQuestion}"

[답변 요청]:
1. 이모지/이모티콘을 절대 넣지 마세요.
2. 학생의 질문에 대해, 학생의 전공(${studentMajor})과 다이어리에 적힌 실습 경험을 고려하여 구체적이고 현실적인 수정 방향을 2~4문장으로 명확히 제시하세요.
3. 지원 기업(${companyName || targetCompanies})의 현장 직무와 연결할 수 있는 힌트를 주세요.`;
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
      console.warn("Gemini API call failed for coach on Vercel, falling back to heuristic:", aiErr?.message || aiErr);
    }

    const replyText = geminiRes?.text || "";

    if (actionType === "ask_question") {
      if (replyText) {
        const cleanedReply = replyText.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        return res.status(200).json({ success: true, answer: cleanedReply });
      }
      return res.status(200).json({
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
        return res.status(200).json({ success: true, feedback: parsed });
      } catch (parseErr) {
        console.warn("JSON parse failed for coach on Vercel, using heuristic:", parseErr);
      }
    }

    const fallbackFeedback = generateFallbackCoaching(companyName, sectionTitle, answer, recommendedChars, userProfile, diaries);
    return res.status(200).json({ success: true, feedback: fallbackFeedback });
  } catch (error: any) {
    console.error("Cover letter coach API error on Vercel:", error);
    const safeFeedback = generateFallbackCoaching(
      req.body?.companyName, 
      req.body?.sectionTitle, 
      req.body?.currentAnswer || '', 
      req.body?.recommendedChars || 500,
      req.body?.userProfile,
      req.body?.diaries
    );
    return res.status(200).json({ success: true, feedback: safeFeedback });
  }
}

function generateFallbackCoaching(
  companyName: string, 
  sectionTitle: string, 
  answer: string, 
  recommendedChars: number,
  userProfile?: any,
  diaries?: any[]
) {
  const trimmed = (answer || '').trim();
  const len = trimmed.length;
  const targetCompany = companyName || '지원 기업';
  const cleanSection = sectionTitle || '자기소개서 문항';
  const studentMajor = userProfile?.major ? `${userProfile.major} 전공` : '전공 실습';

  const hasNumbers = /[0-9]+%?|일간|개월|시간|등|위|차|회|개/.test(trimmed);
  const hasCompany = companyName && companyName !== '지원 기업' ? trimmed.includes(companyName) : false;

  const firstDiary = Array.isArray(diaries) && diaries.length > 0 ? diaries[0] : null;
  const diaryHint = firstDiary ? ` (다이어리에 기록해둔 '${firstDiary.title}' 일화 참고)` : '';

  let speech = "";

  if (len === 0) {
    if (cleanSection.includes("성장과정")) {
      speech = `[성장과정] 문항은 어릴 적 이야기보다 마이스터고 진학 결심 계기나 ${studentMajor}에서 손에 익숙하지 않던 첫 실습의 기억을 적는 것이 가장 효과적입니다. 편하게 첫 문장을 시작해보세요.`;
    } else if (cleanSection.includes("지원동기")) {
      speech = `[지원동기]는 학교에서 갈고닦은 ${studentMajor} 기술과 [${targetCompany}]의 현장 직무가 만나는 지점을 적는 것이 핵심입니다. 학교에서 가장 자신 있게 다뤘던 실습 경험부터 떠올려보세요.`;
    } else if (cleanSection.includes("장단점") || cleanSection.includes("성격")) {
      speech = `[성격의 장단점]은 꼼꼼함이나 책임감 같은 직무 강점을 보여주는 문항입니다. 현장 실습에서 사소한 실수를 줄이기 위해 노력했던 실제 일화를 떠올려보세요.`;
    } else if (cleanSection.includes("포부") || cleanSection.includes("진로")) {
      speech = `[입사 후 포부]는 막연한 다짐보다 신입 때 배울 현장 노하우부터 핵심 기술 인재로의 성장 로드맵을 단계별로 적는 것이 좋습니다.`;
    } else {
      speech = `작성할 준비가 되셨다면 머릿속에 떠오르는 생각을 다듬지 말고 편하게 1~2문장만 적어보세요. 실시간으로 읽고 보완할 점을 바로 짚어드리겠습니다.`;
    }
  } else if (len < 70) {
    speech = `지금 작성하신 문장의 출발이 좋습니다. 이어서 어떤 전공 실습이었는지, 혹은 어떤 과제를 해결하려 했는지 당시의 구체적인 상황을 1~2문장 더 덧붙여보세요.${diaryHint}`;
  } else if (len < 200) {
    if (!hasNumbers) {
      speech = `실습에서 주도적으로 노력한 흐름이 잘 드러나고 있습니다. 여기서 '많은 시간', '열심히' 같은 추상적인 표현 대신 '3주 동안', '오차율 10% 개선'처럼 구체적인 숫자를 섞어주면 신뢰도가 높아집니다.`;
    } else if (!hasCompany && targetCompany !== '지원 기업') {
      speech = `상황과 행동이 자연스럽게 적히고 있습니다. 여기에 본인이 갈고닦은 이 역량이 [${targetCompany}]의 현장에서 어떻게 기여할 수 있을지 한 줄로 연결해보세요.`;
    } else {
      speech = `글의 흐름이 진솔하고 안정적입니다. 당시 문제 상황에서 본인이 맡았던 구체적인 역할(Action)과 사용했던 공구나 기술 명칭을 한두 문장 더 구체적으로 적어보세요.`;
    }
  } else {
    if (!hasCompany && targetCompany !== '지원 기업') {
      speech = `글의 뼈대가 탄탄하게 잡혀 있습니다. 마무리 부분에 이 실습 경험에서 배운 점이 [${targetCompany}]의 현장 안전이나 설비 운영에 어떻게 보탬이 될지 포부 1~2문장으로 매듭지어보세요.`;
    } else if (!hasNumbers) {
      speech = `경험의 전개와 배운 점이 뚜렷합니다. 실습 기간이나 팀원 수, 달성 수치 등 객관적인 숫자를 한두 군데 보완하고 접속사(그리고, 그래서)를 줄이면 문장이 훨씬 간결해집니다.`;
    } else {
      speech = `문장 전달력과 구성이 훌륭합니다. 문장이 너무 길어지지 않게 한 호흡씩 마침표를 찍어주고, 종결어미를 단정형(~했습니다)으로 통일하면 자신감 있는 기술 인재의 인상을 줍니다.`;
    }
  }

  speech = speech.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return { 
    speech,
    summary: speech, 
    praise: "", 
    tips: [speech], 
    nextStepHint: "" 
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
  const targetCompany = companyName || '지원 기업';
  const cleanSection = sectionTitle || '자기소개서 문항';
  const studentName = userProfile?.name || '학생';
  const studentMajor = userProfile?.major || '전공';

  const userDiaries = Array.isArray(diaries) && diaries.length > 0 ? diaries : [];
  const topDiary = userDiaries.length > 0 ? userDiaries[0] : null;

  if (q.includes("너 누구") || q.includes("누구야") || q.includes("mystair") || q.includes("마이스테어") || q.includes("맞아") || q.includes("외계인")) {
    return `네, 저는 마이스터고·특성화고 학생들을 위해 만들어진 취업 멘토 MyStair AI 코치입니다. 학생 대신 글을 지어내는 대필 대신, ${studentName}님이 마이페이지와 다이어리에 기록해둔 진짜 실습과 프로젝트 경험을 바탕으로 합격 자기소개서를 완성할 수 있도록 실시간으로 코칭해 드립니다. 작성 중에 고민되는 부분이 있다면 편하게 질문해 주세요.`;
  }
  if (q.includes("안녕") || q.includes("반가워") || q.includes("하이") || q.includes("hello")) {
    return `안녕하세요, ${studentName}님. [${targetCompany}] 취업을 위해 지금 [${cleanSection}] 문항을 작성 중이시군요. 전공 실습이나 다이어리 경험을 어떻게 녹여낼지 고민되는 점이 있다면 편하게 물어보세요.`;
  }
  if (q.includes("고마워") || q.includes("감사")) {
    return `도움이 되었다니 기쁩니다. 한 문장씩 진솔하게 써내려가다 보면 분명 좋은 자기소개서가 완성될 것입니다. 계속해서 힘내서 작성해 보세요.`;
  }

  if (q.includes("다이어리") || q.includes("경험") || q.includes("마이페이지") || q.includes("기록") || q.includes("알고있어") || q.includes("알고 있어")) {
    if (topDiary) {
      return `${studentName}님의 마이페이지 프로필(${studentMajor})과 성장 다이어리 기록을 모두 파악하고 있습니다. 특히 다이어리에 기록해 두신 '${topDiary.title}' 일화는 ${targetCompany} 자기소개서에 아주 훌륭한 소재입니다. 이 경험을 자기소개서 문맥에 맞게 어떻게 연결하면 좋을지 말씀해 드릴까요?`;
    }
    return `${studentName}님의 마이페이지 프로필 정보(${studentMajor})를 바탕으로 코칭하고 있습니다. 작성 중이신 내용이나 학교 실습 일화에 대해 말씀해 주시면 맞춤 조언을 드리겠습니다.`;
  }

  return `질문해 주신 내용과 관련하여, 작성 중이신 문장 뒤에 전공 실습 과정에서 본인이 직접 겪었던 기술적 문제 해결 일화를 덧붙이시면 훨씬 매력적인 답변이 됩니다.`;
}
