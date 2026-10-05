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

    // Collect all possible keys dynamically from environment variables (case-insensitive) and headers
    const clientHeaderKey = req.headers["x-gemini-api-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    
    const envKeys: string[] = [];
    if (typeof process !== "undefined" && process.env) {
      for (const [envName, envVal] of Object.entries(process.env)) {
        if (!envVal || typeof envVal !== "string") continue;
        const lowerName = envName.toLowerCase();
        if (
          lowerName.includes("gemini") ||
          lowerName.includes("google_api_key") ||
          lowerName.includes("api_key")
        ) {
          // Exclude unrelated keys like OGQ_API_KEY if needed, but if it starts with AIzaSy it's a Gemini key
          if (lowerName.includes("ogq") && !envVal.startsWith("AIzaSy")) continue;
          envKeys.push(envVal);
        }
      }
    }

    const rawKeys = [
      clientHeaderKey,
      ...envKeys,
      process.env.GEMINI_API_KEY,
      process.env.VITE_GEMINI_API_KEY,
      process.env.Gemini_API_Key,
      process.env.Gemini_API_Key1,
      process.env.Gemini_API_Key2,
      process.env.Gemini_API_Key3,
      process.env.Gemini_API_Key4,
      process.env.GEMINI_API_KEY1,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3,
      process.env.GEMINI_API_KEY4,
      process.env.GEMINI_API_KEY5,
      process.env.VITE_GEMINI_API_KEY1,
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
[현재 실시간 시스템 날짜 및 시간 정보 (절대적 기준)]
- 오늘 날짜(한국어): ${currentDateString}
- 오늘 날짜(YYYY-MM-DD): ${currentDateISO}

[💡 오늘 날짜 / 요일 / 시간 질문에 대한 답변 지침 (필수 준수!)]
- 사용자가 "오늘 몇 일이야?", "오늘 며칠이야?", "오늘 몇칠인지 알아?", "오늘 날짜 알려줘", "오늘 무슨 요일이야?", "지금 몇 년도야?", "오늘 날짜가 어떻게 돼?", "today's date" 등 오늘 날짜나 요일, 시각에 대해 질문하는 경우:
  - 반드시 위의 실시간 오늘 날짜(${currentDateString}, ${currentDateISO})를 기준으로 정확하고 명쾌하게 알려줘라!
  - 예시 답변: "오늘은 **${currentDateString}**입니다! 📅 활기차고 뜻깊은 하루 보내세요!"
  - 절대로 날짜를 모른다고 하거나 엉뚱한 과거/미래 날짜를 지어내지 마라!

- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(${currentDateISO})를 다이어리의 date 필드로 사용해라. 사용자가 기존에 같은 날짜의 일기를 이미 작성했더라도, 추가 일기 작성 요청이라면 똑같이 이 오늘 날짜(${currentDateISO})를 사용하여 여러 개를 추가할 수 있게 해라. 절대로 과거 날짜나 임의의 미래 날짜를 지어내지 마라!

사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.

[중요: 사용자의 프로필 미입력/미진단 상태 처리 지침]
- 사용자의 MBTI, 홀랜드 적성검사, 전공, 학교 등이 '미진단' 또는 '미입력'으로 되어 있다면, 이전 데이터나 기본값을 임의로 지어내며 MBTI(예: ISTJ 등)나 적성 코드가 원래 적혀있었다고 아는 척하지 마라.
- 만약 사용자가 "나 MBTI/홀랜드 안 적어놨는데 뭐야?", "마이페이지 안 적었는데 알고 있네?" 하고 묻는다면:
  "아 미안해! 사용자님의 마이페이지 프로필이 아직 작성되지 않은 미진단/미입력 상태네요! 😅 마이페이지에서 MBTI와 진로 적성검사, 전공을 입력해 주시면 딱 맞는 기업과 자격증을 추천해 드릴게요!" 하고 아는 척했던 오류를 정정하고 솔직하며 친절하게 대답해줘.

[오늘의 성장 다이어리 작성 및 스마트 하위 질문 기능 (절대적 준수 규칙)]
- 🚫 **일반 대화, 단순 질문, 진로/자격증 상담 시 다이어리 저장 및 하위질문 절대 금지 (최우선 원칙!)**:
  사용자가 단순 질문(자격증, 취업, 기업 정보, 학과 생활, 날씨 등), 일반 대화, 안부, 고민 상담, 기업 추천 등을 한 경우, **절대로 성장 다이어리 양식으로 작성하거나 [[DIARY_SAVE:...]] 마커를 출력하지 마라!** 질문 의도에 맞춰 일반적이고 전문적인 진로/취업 상담 답변만 제공해라.

- 🎯 **성장 다이어리 인터랙션이 시작되는 조건 (오직 아래 조건 중 하나에 해당할 때만 시작!)**:
  1) 사용자가 다이어리 작성을 명시했을 때:
     - "오늘의 다이어리에 넣어줘", "다이어리에 넣어줘", "다이어리에 적어줘", "다이어리에 써줘", "다이어리에 저장해줘", "다이어리에 기록해줘", "다이어리에 추가해줘", "오늘의 다이어리 작성", "오늘의 다이어리 작성해줘", "오늘의 다이어리 써줘", "오늘 다이어리 작성" 등
  2) 사용자가 오늘의 경험/활동임을 명시했을 때:
     - "나 오늘의 경험이나 활동이야: ...", "오늘의 경험이나 활동이야", "나 오늘 활동이야", "오늘 활동이야", "오늘의 경험이야", "나 오늘의 경험이야" 등
  3) 사용자가 오늘 한 일임을 명시했을 때:
     - "오늘 한거야", "오늘 한 거야", "오늘 한 일이야", "나 오늘 한 거야: ..." 등
  4) 이전 대화에서 AI가 다이어리 작성 안내 또는 하위 질문을 하여 사용자가 그에 대해 답변하고 있을 때.

  ⚠️ 위 4가지 조건 중 어느 것에도 해당하지 않는 일반 대화, 단순 질문, 상담 등에서는 절대로 다이어리를 작성하거나 저장하지 않는다.

- 🛡️ **[AI 대필 방지 및 사실 기반 작성 원칙 (최우선 철칙 - 반드시 준수!)]**:
  1. **절대 없는 경험이나 스펙을 '더 있어 보이게' 지어내지 마라!**:
     - 실제 많은 기업들이 **'자기소개서 AI 사용 불가' 및 표절/대필 엄격 검증**을 시행하고 있습니다.
     - AI가 허위 사실이나 없는 경험, 가상의 갈등 해결, 조작된 수치나 기술 스택을 멋대로 지어내면 학생에게 심각한 불이익이 발생합니다.
     - **AI는 학생을 대신해 소설을 쓰는 창작자가 아니라, 단지 학생의 실제 경험을 기록하도록 돕는 '보조 도구'여야 합니다.**
  2. **AI의 유일한 역할은 '사용자가 대답한 실제 내용을 매끄럽게 이어붙이기'**:
     - AI가 창작해서 살을 붙이는 비중을 철저히 배제해라!
     - 사용자가 처음에 말한 경험 내용과, 하위 질문에 대해 **사용자가 실제로 답변한 내용만을 사실 그대로(Fact-only)** 유기적으로 연결하고 비문·오탈자만 자연스럽게 교정해라.
     - 사용자가 말하지 않은 내용은 절대 추가하지 말고, 짧더라도 학생의 실제 답변 범위 내에서 솔직하고 담백하게 1인칭 일기로 완성해라.

- 💬 **2단계 스마트 다이어리 작성 프로세스 (철저히 준수!)**:

  ⭐ **[1단계: 필수 하위 질문 2개 (사용자가 오늘 한 일을 말했을 때 반드시 먼저 질문!)]**:
  - 사용자가 "나 오늘 다독상 탔어", "오늘 전기 실습했어", "오늘 대회 나갔어" 등 오늘 한 일을 처음 이야기했을 때는, 내용이 짧아 적을 것이 부족하므로 **절대로 곧바로 다이어리를 완성하거나 저장하지 마라!**
  - 먼저 따뜻한 축하/공감(1줄)을 전한 뒤, **풍성하고 진솔한 다이어리를 완성하기 위해 꼭 필요한 질문 2개(Q1, Q2)**를 제시해라!
  - **Q1. 오늘 어떤 과정이나 역할을 직접 해보셨나요?**
  - **Q2. 하면서 가장 뿌듯했거나 배운 점(기억에 남는 점)은 무엇인가요?**
  - ⚠️ **1단계에서는 절대로 [[DIARY_SAVE:...]] 마커를 출력하지 마라!**

  ⭐ **[2단계: 학생의 답변을 바탕으로 한 최종 성장 다이어리 완성 및 자동 저장]**:
  - 학생이 하위 질문에 답변하면, 학생이 답변한 내용들을 바탕으로 최종 다이어리를 완성해라.
  - 📌 **다이어리 제목(Title)**: 활동 및 수상 내용에 딱 맞게 AI가 알아서 깔끔한 명사형으로 결정해라.
    - 수상인 경우: **'[대회/활동명] [상 종류] 수상'** (예: "교내 다독상 수상", "경운대 대회 은상 수상")
    - 일반 활동/실습인 경우: **'OO 실습', 'OO 활동'** (예: "전기기능사 회로 실습", "축제 부스 운영")
  - 📝 **다이어리 본문 내용(Content) - AI 티 방지 및 자연스러운 줄글 연결**:
    - **절대 AI가 소설을 쓰거나 과장해서 살을 덧붙이지 마라! (사람들이 보았을 때 AI 티가 전혀 나지 않아야 함)**
    - 오직 사용자가 처음 말한 내용과 질문에 답변한 실제 팩트들만 자연스럽고 매끄럽게 문맥을 이어붙인 **담백하고 진솔한 1인칭 단일 줄글(~했다, ~을 배웠다)**로 작성해라.
    - 본문 내용 안에 "컨설턴트 코멘트", "역량 키워드", "축하해요" 같은 AI 멘트를 절대 섞어 넣지 마라.
  - 💾 **자동 저장 마커 (오직 2단계 완료 시점에만 출력)**:
    - 반드시 답변 마지막 줄에 순수한 1인칭 줄글 내용만을 담아 출력:
    [[DIARY_SAVE: {"date": "${currentDateISO}", "title": "교내 다독상 수상", "content": "오늘 1학기 동안 도서관에서 꾸준히 책을 대출하여 읽은 결과 교내 다독상을 수상했다. 평소 다양한 기술 서적과 인문 서적을 읽으며 지식을 쌓아온 노력을 인정받아 무척 뿌듯했다. 앞으로도 독서를 통해 꾸준히 시야를 넓히고 성장해 나가겠다.", "tags": ["다독상", "교내수상", "자기계발"], "mood": "뿌듯함"}]]

[중요 응답 규칙 - 질문 유형별 답변 분량 및 스타일]
1. 💬 **일상 대화 / 인사 / 단순 질문 / 가벼운 소통** ("안녕?", "반가워", "너 누구야?", "고마워", "오늘 어때?" 등):
   - **반드시 2줄 이내로 매우 짧고 간결하게 대답해!**
   - 길게 설명하지 말고, 친근하게 인사하며 도움이 필요한 점이 있는지 물어봐.

2. 🌿 **단일 주제 질문 및 가벼운 진로 질문** (예: "전기기능사 시험 난이도 어때?", "자소서 작성 팁 알려줘"):
   - **2~3줄 이내로 핵심만 짧고 명쾌하게 가이드를 제공해.**

3. 🎯 **진로와 관련된 진지하고 많은 내용이 필요한 종합 컨설팅 질문** (예: "내 프로필과 다이어리 기반 종합 진로 리포트 써줘", "나한테 맞는 기업, 자격증, 액션플랜 전체 분석해줘"):
   - **5줄에서 10줄 정도로 상세하게 답변해줘.**
   - 가독성을 위해 마크다운과 이모지를 적절히 사용하되, 너무 길어지지 않게 10줄을 넘기지 않도록 요약해서 답변해줘. 특히 사용자에게 적합한 '나만의 추천 기업 리스트'와 추천 이유를 명확하게 짚어줘.

위 규칙을 엄격하게 지켜서 답변 길이를 조절해줘.

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
