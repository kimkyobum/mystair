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
    const { apiKey, question, answer, category, targetCompany, targetRole, behaviorMetrics } = body;

    if (!question || !answer) {
      return res.status(400).json({ error: "질문과 답변이 필요합니다." });
    }

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

    const prompt = `
당신은 마이스터고 및 직업계고 학생 채용을 전문으로 하는 대기업/공기업 50대 베테랑 기술 면접관입니다.
지원자가 제시한 면접 질문 답변과 실시간 카메라 행동 분석 지표(목소리 크기, 시선, 어깨 수평, 손톱 만지기나 얼굴 손대기 등 거슬리는 습관, 자세, 눈 깜빡임, 표정)를 종합 평가하고,
실제 사람이 직접 묻는 것처럼 실전 꼬리 질문 2개를 생성해 주세요.

[지원 정보]
- 희망 기업: ${targetCompany || "기술 중심 기업"}
- 직무 / 전공: ${targetRole || "엔지니어링 / 생산기술"}
- 면접 질문 유형: ${category || "역량"}

[면접 질문]
"${question}"

[지원자의 구술 답변]
"${answer}"

[실시간 카메라 영상 및 음성 행동 분석 수치]
- 시선 유지도 (Eye Contact): ${eyeContactScore}%
- 어깨 수평 상태: ${shoulderStatus === 'level' ? '수평 양호' : '어깨 기울어짐 발생'} (${shoulderMessage})
- 자세 안정도 (Posture Stability): ${postureStability}%
- 목소리 성량/크기 (Voice Loudness): ${voiceLoudnessScore}%
- 거슬리는 산만한 행동 횟수 (얼굴/입 손대기, 손톱 물어뜯기 등): ${fidgetingCount}회
- 총 눈 깜빡임: ${totalBlinkCount}회 (분당 약 ${blinkRatePerMin}회 속도)
- 표정 진단: ${expressionStatus === 'good' ? '자연스러운 호감형 미소' : expressionStatus === 'neutral' ? '차분한 기본 표정' : '긴장으로 굳은 표정'} (${expressionMessage})
- 감지된 거슬리는 습관: ${distractingHabits.length > 0 ? distractingHabits.join(", ") : "특이사항 없음"}

[엄격한 태도 감점 및 현실적 평가 원칙]
- 실제 대기업/공기업 면접에서는 비언어적 산만함(얼굴 손대기, 손톱 만지기, 시선 회피, 눈 깜빡임 과다, 어깨 비대칭)을 중요한 태도 지표로 평가합니다.
- 시선 유지도 70% 미만: 15~25점 감점
- 어깨 수평 불량/상체 기울어짐: 8~15점 감점
- 자세 안정도 70% 미만: 15~20점 감점
- 손버릇(얼굴/턱/손톱 만지기)이 1회 이상 감지되면: 즉시 15~25점 감점
- 눈 깜빡임이 28회/분 이상으로 과도하면: 8~12점 감점
- 밝은 표정과 바른 어깨 수평, 성실한 답변이 어우러질 때 85~95점의 높은 점수를 부여하세요.
- 태도 불량이 심각하면 점수를 50~65점대로 감점하여 구체적인 개선 피드백을 제공하세요.

[꼬리 질문 생성 원칙]
1. 지원자가 경험이나 프로젝트를 언급했다면: "그 경험을 통해 최종적으로 본인이 얻게 된 점이나 역량이 구체적으로 무엇인가?"
2. 협업이나 갈등 상황과 연계하여: "그 과정에서 동료나 조원과 의견 충돌이나 다툼은 없었는지, 어떻게 조율했는가?"

다음 JSON 형식으로만 엄격하게 응답해 주세요:
{
  "score": 45~95 사이의 종합 점수(숫자),
  "comment": "답변 내용과 목소리 크기, 시선, 손톱/손동작 태도를 결합한 냉철하고 현실적인 총평(2~3문장)",
  "followUpQuestions": [
    "경험을 통해 무엇을 얻었는지 묻는 실전 꼬리 질문 1",
    "동료/친구와의 갈등이나 소통 과정을 묻는 실전 꼬리 질문 2"
  ],
  "goodPoints": ["답변 내용 및 태도 측면에서 잘한 점 1", "잘한 점 2"],
  "improvePoints": ["내용이나 자세/시선/손버릇 측면에서 보완하면 좋을 점 1", "보완하면 좋을 점 2"]
}
`;

    const systemInstruction = "너는 실전 채용 현장의 냉철하면서도 전문적인 50대 남성 기술 면접관입니다. 학생의 행동과 답변을 현실감 있게 평가하고 태도 불량 시 엄격히 감점합니다.";

    let aiResult: any = null;

    if (apiKey && typeof apiKey === "string" && apiKey.startsWith("AIzaSy")) {
      try {
        const customGenAI = new GoogleGenAI({ apiKey });
        const resp = await customGenAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        });
        aiResult = resp;
      } catch (customErr) {
        console.warn("Custom key evaluation failed on Vercel, falling back to rotation pool", customErr);
      }
    }

    if (!aiResult) {
      try {
        aiResult = await generateContentWithFallback(
          [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction
        );
      } catch (aiErr) {
        console.warn("Gemini interview evaluation on Vercel failed, using rule-based evaluator", aiErr);
      }
    }

    if (aiResult && aiResult.text) {
      const cleaned = aiResult.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        const returnedFollowUps = parsed.followUpQuestions || (parsed.followUpQuestion ? [parsed.followUpQuestion] : [
          "그 경험을 통해 최종적으로 본인이 얻게 된 가장 큰 역량이나 깨달음은 무엇이었나요?",
          "그 과정에서 동료나 조원과 의견 충돌이나 다툼은 없었습니까? 어떻게 조율했나요?"
        ]);
        return res.status(200).json({
          score: parsed.score ?? 78,
          comment: parsed.comment || "자신의 경험을 바탕으로 솔직하게 답변하셨습니다.",
          followUpQuestions: returnedFollowUps,
          goodPoints: parsed.goodPoints || ["실제 경험을 바탕으로 진솔하게 설명함", "직무에 대한 열정이 드러남"],
          improvePoints: parsed.improvePoints || ["결과 수치를 함께 제시하면 설득력이 높아집니다", "두괄식 문장 구성을 추천합니다"]
        });
      } catch (e) {
        console.warn("Parse error in evaluate-interview on Vercel", e);
      }
    }

    // Fallback rule-based evaluation engine
    const ansLen = (answer || "").length;
    let baseScore = 88;
    if (ansLen < 30) baseScore -= 12;
    else if (ansLen > 100) baseScore += 5;

    const penaltyItems: string[] = [];
    if (eyeContactScore < 70) {
      const p = Math.min(25, Math.round((70 - eyeContactScore) * 0.9));
      baseScore -= p;
      penaltyItems.push(`카메라 시선 불안정(-${p}점)`);
    }
    if (postureStability < 70) {
      const p = Math.min(22, Math.round((70 - postureStability) * 0.8));
      baseScore -= p;
      penaltyItems.push(`상체 흔들림 및 자세 불량(-${p}점)`);
    }
    if (fidgetingCount > 0) {
      const p = Math.min(30, fidgetingCount * 12 + 10);
      baseScore -= p;
      penaltyItems.push(`얼굴/턱/손톱 만지는 산만한 손버릇 ${fidgetingCount}회 감지(-${p}점)`);
    }
    if (shoulderStatus !== 'level') {
      baseScore -= 10;
      penaltyItems.push(`어깨 비대칭 및 기울어짐(-10점)`);
    }
    if (blinkRatePerMin >= 28) {
      baseScore -= 8;
      penaltyItems.push(`과도한 눈 깜빡임(-8점)`);
    }

    const finalScore = Math.max(45, Math.min(96, baseScore));
    let comment = `성실한 답변 태도가 돋보였습니다.`;
    if (penaltyItems.length > 0) {
      comment = `답변 내용은 무난하나, ${penaltyItems.join(', ')} 등의 비언어적 태도에서 큰 감점이 발생했습니다. 면접관 앞에서는 손동작을 정돈하고 카메라 렌즈를 정면으로 응시하세요.`;
    } else {
      comment = `안정된 어깨 수평과 당당한 시선 처리, 단정한 표정이 매우 긍정적입니다. 실전에서도 이 자신감을 유지하시기 바랍니다.`;
    }

    return res.status(200).json({
      score: finalScore,
      comment,
      followUpQuestions: [
        `말씀하신 프로젝트나 실습 과정에서 본인이 주도적으로 해결한 가장 어려웠던 기술적 난관은 무엇이었습니까?`,
        `그 경험 중에 팀원이나 동료와 의견 차이가 발생했을 때 본인은 어떻게 설득하고 조율하셨습니까?`
      ],
      goodPoints: [
        `차분하고 명확한 어조로 질문의 의도에 맞게 서술함`,
        `실제 고교 전공 실습 및 프로젝트 중심의 사실적 경험 언급`
      ],
      improvePoints: penaltyItems.length > 0 ? penaltyItems : [
        `답변 첫 문장을 '네, 제 경험은 ~입니다'처럼 명확한 두괄식 결론으로 시작해 보세요.`
      ]
    });
  } catch (error: any) {
    console.error("Error in evaluate-interview handler on Vercel:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error?.message });
  }
}
