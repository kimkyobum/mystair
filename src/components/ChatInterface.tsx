import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw, Trash2, MessageSquare, ArrowRight, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { useChat, Message } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInterface() {
  const { language, t } = useLanguage();
  const { isLightMode } = useTheme();
  const { userProfile: firestoreProfile, fetchDiaries, saveDiary, user } = useAuth();
  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    initialMessage,
    clearChat
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const initialSentRef = useRef(false);

  // Initial call on mount
  useEffect(() => {
    if (initialMessage && !initialSentRef.current && messages.length === 0) {
      initialSentRef.current = true;
      const initialMsg: Message = { id: '1', role: 'user', content: initialMessage };
      setMessages([initialMsg]);
      sendMessageToAI(initialMessage, []);
    }
  }, [initialMessage]);

  const getCombinedProfileData = () => {
    let profile = {
      name: firestoreProfile?.name || '',
      highSchool: firestoreProfile?.highSchool || '',
      major: firestoreProfile?.major || '',
      mbti: firestoreProfile?.mbti || '',
      hollandCode: firestoreProfile?.hollandCode || '',
      targetCompanies: firestoreProfile?.targetCompanies || []
    };

    try {
      const savedMyPage = localStorage.getItem('mystair_mypage_data');
      if (savedMyPage) {
        const parsed = JSON.parse(savedMyPage);
        if (parsed.name) profile.name = parsed.name;
        if (parsed.highSchool) profile.highSchool = parsed.highSchool;
        if (parsed.major) profile.major = parsed.major;
        if (parsed.mbti) profile.mbti = parsed.mbti;
        if (parsed.hollandCode) profile.hollandCode = parsed.hollandCode;
        if (parsed.targetCompanies && Array.isArray(parsed.targetCompanies)) profile.targetCompanies = parsed.targetCompanies;
      }
    } catch (e) {
      console.error('Error parsing local mypage data:', e);
    }

    try {
      const currentUid = firestoreProfile?.uid || user?.uid || 'local-user';
      const savedLocal = localStorage.getItem(`mystair_local_user_profile_${currentUid}`);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (!profile.name && parsed.name) profile.name = parsed.name;
        if (!profile.highSchool && parsed.highSchool) profile.highSchool = parsed.highSchool;
        if (!profile.major && parsed.major) profile.major = parsed.major;
        if (!profile.mbti && parsed.mbti) profile.mbti = parsed.mbti;
        if (!profile.hollandCode && parsed.hollandCode) profile.hollandCode = parsed.hollandCode;
        if ((!profile.targetCompanies || profile.targetCompanies.length === 0) && Array.isArray(parsed.targetCompanies)) {
          profile.targetCompanies = parsed.targetCompanies;
        }
      }
    } catch (e) {
      console.error('Error parsing local user profile:', e);
    }

    return profile;
  };

  const getCombinedDiariesData = async () => {
    let diariesList: any[] = [];
    try {
      const dbDiaries = await fetchDiaries();
      if (dbDiaries && dbDiaries.length > 0) {
        diariesList = dbDiaries;
      }
    } catch (e) {
      console.error('Error fetching db diaries:', e);
    }

    if (diariesList.length === 0) {
      try {
        const currentUid = firestoreProfile?.uid || user?.uid || 'local-user';
        const savedDiaries = localStorage.getItem(`mystair_local_diaries_${currentUid}`) || localStorage.getItem('mystair_diaries');
        if (savedDiaries) {
          diariesList = JSON.parse(savedDiaries);
        }
      } catch (e) {
        console.error('Error parsing local diaries:', e);
      }
    }
    return diariesList;
  };

  const generateClientGemini = async (text: string, profile: any, diaries: any, historyMessages: Message[] = []) => {
    const keys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY2,
      import.meta.env.VITE_GEMINI_API_KEY3,
      import.meta.env.VITE_GEMINI_API_KEY4,
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY2 : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY3 : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY4 : '')
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
      throw new Error('Vercel/Render 환경변수 설정에서 VITE_GEMINI_API_KEY 또는 GEMINI_API_KEY를 올바르게 설정해주셔야 AI 응답이 가능합니다.');
    }

    const profileText = profile
      ? `
[사용자 프로필 데이터]
- 이름: ${profile.name || "미입력"}
- 학교 및 전공: ${profile.highSchool || "미입력"} / ${profile.major || "미입력"}
- MBTI 성격유형: ${profile.mbti || "미진단 (MBTI 미입력)"}
- 홀랜드 진로적성: ${profile.hollandCode || "미진단 (홀랜드 코드 미입력)"}
- 희망/관심 기업: ${
          Array.isArray(profile.targetCompanies) && profile.targetCompanies.length > 0
            ? profile.targetCompanies.join(", ")
            : "미선택 (희망 기업 미지정)"
        }
`
      : "[사용자 프로필 미입력 - 마이페이지 미작성 상태]";

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
        : "[성장 다이어리 기록 없음]";

    // Helper for accurate Korea Standard Time (KST, UTC+9) date & time calculations
    const getKoreaDateTimeInfo = () => {
      const now = new Date();
      
      const fullFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const isoFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const parts = isoFormatter.formatToParts(now);
      const year = parts.find(p => p.type === 'year')?.value || String(now.getFullYear());
      const month = parts.find(p => p.type === 'month')?.value || String(now.getMonth() + 1).padStart(2, '0');
      const day = parts.find(p => p.type === 'day')?.value || String(now.getDate()).padStart(2, '0');
      
      const currentDateISO = `${year}-${month}-${day}`;
      const currentDateString = fullFormatter.format(now);
      const currentTimeString = timeFormatter.format(now);
      
      const enFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      const currentDateEn = enFormatter.format(now);

      return { currentDateISO, currentDateString, currentTimeString, currentDateEn, year, month, day };
    };

    const { currentDateISO, currentDateString, currentTimeString, currentDateEn } = getKoreaDateTimeInfo();

    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
[현재 실시간 시스템 날짜 및 시간 정보 (절대적 기준)]
- 오늘 날짜(한국어): ${currentDateString}
- 오늘 날짜(YYYY-MM-DD): ${currentDateISO}
- 현재 시각: ${currentTimeString} (한국 표준시 KST 기준)
- 오늘 날짜(영문): ${currentDateEn}

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

[오늘의 성장 다이어리 자동 작성 및 저장 기능 (절대적 준수)]
- **절대적 날짜 규칙**: 절대로 2026-09-XX, YYYY-MM-DD, XX 같은 가상/와일드카드 날짜나 순서가 바뀐 날짜(2026-26-09 등)를 쓰지 마라! 오늘 날짜는 무조건 **${currentDateISO}** (${currentDateString})이다!
- 사용자가 "오늘의 다이어리 써줘", "오늘 일기 적어줘", "다이어리에 ~내용 적어줘", "저 내용 정리해서 성장다이어리에 넣어줘", "내용을 성장다이어리에 넣어줘"라고 요청하거나, 자신의 하루 활동/실습/자치활동/공부/경험/사진 등을 공유한 경우:
  1) 사용자가 오늘 있었던 일의 내용을 전혀 알려주지 않고 대화 기록에도 아무 활동 내용이 없는 상태에서 단지 "오늘의 다이어리 써줘"만 입력한 경우:
     - **절대 다이어리를 가상으로 지어내어 작성하지 마라! [[DIARY_SAVE:...]] 마커도 절대 생성하지 마라!**
     - 친근하게 무슨 일이 있었는지 물어봐라:
       "오늘 어떤 일이나 배운 내용이 있으셨나요? 🌿\n\n'오늘 전기기능사 실습했어', '전교 학생회 활동했어', '한화 연수 다녀왔어' 처럼 있었던 일을 간단히 말씀해주시면, 깔끔한 성장 다이어리로 다듬어서 일기에 자동으로 등록해 드릴게요! 😊"
  2) 사용자가 오늘 또는 특정 날짜의 경험/활동(예: 다독상 수상, 실습, 공부, 대회 등)을 말했거나, 다이어리에 넣어달라고 한 경우:
     - **성장 다이어리 정리 양식 (필수)**: 아래 구조로 깔끔하게 요약해서 채팅으로 답변해줘:
       🗓 **${currentDateISO} 오늘의 성장 다이어리: [다독상 수여, 전기기능사 실습 등 사실적이고 구체적인 제목 (추상적인 제목 금지)]**

       • **오늘의 성장 기록**: [학생의 경험을 학생이 직접 쓴 일기처럼 자연스럽게 1인칭 시점으로 2~3문장 기술]
       • **핵심 역량**: #태그1 #태그2
       💬 **MyStair의 조언**: [학생에게 보내는 따뜻한 응원 1~2줄]

     - **날짜 구분 규칙**: 사용자가 "오늘의 다이어리에 넣지말고 각 날짜에 넣어줘"라고 하거나 특정 날짜(예: 7/20, 7/21)를 지정한 경우, 요청된 각각의 날짜(date: 'YYYY-MM-DD')별로 개별 다이어리 항목을 만들어 JSON 배열로 마커를 출력해라. 별도 날짜 지정이 없거나 '오늘'인 경우 무조건 **${currentDateISO}**를 사용해라.
     - **제목 규칙**: 제목은 '지식의 깊이를 더하다' 같은 추상적인 문장이 아니라, '다독상 수여', '회로 설계 실습', '학생회 질서 지도'처럼 팩트 중심의 명사형으로 매우 짧게 작성해라.
     - **다이어리 내용(content) 규칙**: JSON 마커의 "content" 필드 안에는 활동, 성취, 메시지 등을 항목별로 나누지 마라! 오직 "내가 직접 쓴 일기"처럼 자연스러운 줄글 형태로만 작성해라. (예: "오늘 교내 다독상을 받았다. 꾸준히 책을 읽은 보람이 느껴졌고, 앞으로 전공 지식뿐만 아니라 폭넓은 독서를 통해 더 성장하는 엔지니어가 되어야겠다.")
     - **자동 저장 JSON 마커 (필수)**: 반드시 답변 제일 마지막 줄에 아래 형태의 JSON 마커를 정확히 출력해야 해! (마커 안의 content는 오직 일기 내용만 들어감)
       - 단일 날짜 예시:
         [[DIARY_SAVE: {"date": "${currentDateISO}", "title": "다독상 수여", "content": "오늘 교내 다독상을 받았다. 꾸준한 독서를 통해 얻은 지식을 바탕으로 더 훌륭한 엔지니어가 되어야겠다.", "tags": ["독서", "자기주도학습"], "mood": "🔥"}]]
       - 다중 날짜 예시:
         [[DIARY_SAVE: [{"date": "${currentDateISO}", "title": "회로 설계 실습", "content": "오늘은 회로 설계 실습을 진행했다. 처음엔 헷갈렸지만 끝까지 해내서 뿌듯하다.", "tags": ["실습"], "mood": "열정"}]]]

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
`;

    let finalSystemInstruction = systemInstruction;
    if (language === 'en') {
      finalSystemInstruction += `

[LANGUAGE REQUIREMENT]
CRITICAL: The current user interface language is English ('en'). You MUST reply entirely in English! 
- Translate all insights, guidance, recommendations, greetings, and notes to English naturally.
- Use supportive, professional, and clear English appropriate for high school students.
- Keep the response structured, clear, and highly professional.
- Do NOT use Korean unless explaining a very specific Korean term (which should also be accompanied by its English translation/explanation).
- If the user asks in Korean, still reply in English because the site language is set to English.
`;
    } else {
      finalSystemInstruction += `

[LANGUAGE REQUIREMENT]
CRITICAL: 현재 사용자의 인터페이스 언어 설정은 한국어('ko')입니다. 반드시 한국어로 대답해주세요.
`;
    }

    const recentHistory = historyMessages
      .filter((m) => m.content && !m.content.includes("⏳ **API 사용량이") && !m.content.includes("⚠️ AI 설정 안내"))
      .slice(-6);

    const contents: any[] = [];
    if (recentHistory.length > 0) {
      for (const hist of recentHistory) {
        contents.push({
          role: hist.role === "user" ? "user" : "model",
          parts: [{ text: hist.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${text}`,
        },
      ],
    });

    // Client-side Key Rotation & Fallback Loop
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
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: finalSystemInstruction,
              temperature: 0.7,
            },
          });

          console.log(`Client direct direct API call succeeded using key index ${keyIndex} with model ${modelName}`);
          return response.text || (language === 'en' ? "Failed to generate a response. Please try again." : "답변을 생성하지 못했습니다. 다시 시도해주세요.");
        } catch (err: any) {
          console.warn(`Client direct API key index ${keyIndex} failed with model ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }
    }

    throw lastError || new Error("All client-side Gemini API keys and model calls failed.");
  };

  // Helper function for smooth character-by-character typewriter animation
  const animateTyping = (msgId: string, fullText: string): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      // Step size: 1 character for short texts, 2~3 characters for longer responses for smooth pace
      const stepSize = fullText.length > 500 ? 3 : (fullText.length > 200 ? 2 : 1);
      
      const timer = setInterval(() => {
        currentIndex += stepSize;
        if (currentIndex >= fullText.length) {
          clearInterval(timer);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, content: fullText, isStreaming: false }
                : m
            )
          );
          resolve();
        } else {
          const currentChunk = fullText.slice(0, currentIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, content: currentChunk, isStreaming: true }
                : m
            )
          );
        }
      }, 15);
    });
  };

  const sendMessageToAI = async (text: string, existingMessages: Message[]) => {
    setIsLoading(true);

    const tempAiMsgId = (Date.now() + 1).toString();
    
    // Add placeholder AI loading state
    setMessages((prev) => [
      ...prev,
      { id: tempAiMsgId, role: 'ai', content: '', isStreaming: true }
    ]);

    let profile: any = null;
    let diaries: any[] = [];

    try {
      profile = getCombinedProfileData();
      diaries = await getCombinedDiariesData();

      // Format history for server
      const chatHistory = existingMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      let responseText = '';
      let fetchSuccess = false;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            chatHistory: chatHistory,
            userProfile: profile,
            diaries: diaries,
            language: language
          })
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.response) {
              responseText = data.response;
              fetchSuccess = true;
            }
          }
        }
      } catch (e) {
        console.warn('Server endpoint /api/chat unavailable, switching to client direct API...', e);
      }

      // If server endpoint failed or returned non-JSON, fallback to direct client-side Gemini API
      if (!fetchSuccess) {
        try {
          responseText = await generateClientGemini(text, profile, diaries, messages);
        } catch (clientErr: any) {
          console.error('Client Gemini fallback error:', clientErr);
          const errStr = String(clientErr?.message || clientErr);
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
            responseText = language === 'en'
              ? "⏳ **The API usage has temporarily reached its limit due to high traffic.**\n\nGoogle Gemini free tier's requests per minute limit has been exceeded. **Please try again in about 30 seconds to 1 minute**, and we will be happy to answer you! 😊"
              : "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 바로 답변해 드릴게요! 😊";
          } else {
            responseText = language === 'en'
              ? `⚠️ AI Configuration Notice:\n\nPlease register **VITE_GEMINI_API_KEY** or **GEMINI_API_KEY** in the environment variables to activate AI responses.\n\n(Details: ${errStr})`
              : `⚠️ AI 설정 안내:\n\nVercel 또는 Render 환경 변수(Environment Variables)에 **VITE_GEMINI_API_KEY** 또는 **GEMINI_API_KEY**를 추가 등록해주시면 AI 응답이 작동합니다.\n\n(상세 원인: ${errStr})`;
          }
        }
      }

      // Check if user request is a bare/empty diary request without activity details
      const isBareDiaryRequest = (userText: string): boolean => {
        const trimmed = userText.trim().replace(/[?!.~]/g, '');
        const barePhrases = [
          "오늘의 다이어리 써줘",
          "오늘 다이어리 써줘",
          "다이어리 써줘",
          "오늘 일기 적어줘",
          "일기 적어줘",
          "일기 써줘",
          "오늘 일기 써줘",
          "성장 다이어리 써줘",
          "다이어리 작성해줘",
          "일기 작성해줘",
          "다이어리 써줘라",
          "일기 써주세요",
          "오늘 다이어리 작성해줘",
          "오늘 다이어리 적어줘",
          "오늘의 다이어리 작성해줘"
        ];
        if (barePhrases.includes(trimmed)) return true;

        const hasDiaryKeyword = /다이어리|일기/i.test(trimmed);
        const hasWriteKeyword = /써줘|적어줘|작성|만들어/i.test(trimmed);
        const hasActivityDetail = /했어|갔어|땄어|배웠어|공부|실습|수상|완료|합격|정리|취득|저 내용|이 내용|아까|위 내용|내용|경험|사진|첨부/i.test(trimmed);

        if (hasDiaryKeyword && hasWriteKeyword && !hasActivityDetail && trimmed.length < 22) {
          return true;
        }
        return false;
      };

      const bareRequest = isBareDiaryRequest(text);

      if (bareRequest) {
        // Strip any JSON marker AI might have accidentally generated
        responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();

        // Ensure response asks user for experience details politely
        const isAiAskingQuestions = /어떤 일이나 배운 내용|무슨 내용을|말씀해주시면|어떤 경험/i.test(responseText);
        if (!isAiAskingQuestions) {
          responseText = language === 'en'
            ? "Did you have any achievements or learning experiences today? 🌿\n\nIf you tell us briefly, like 'I practiced electrical technician skills today' or 'I won a reading award', we'll refine it into a neat Growth Diary for you! 😊"
            : "오늘 어떤 일이나 배운 내용이 있으셨나요? 🌿\n\n'오늘 전기기능사 실습했어', '다독상 땄어' 처럼 있었던 일을 간단히 말씀해주시면, 깔끔한 성장 다이어리로 다듬어서 일기에 자동으로 작성해 드릴게요! 😊";
        }
      } else {
        // Dual-Stage Automatic Diary Saver (Multi-Date & Specific Date Support)
        let diarySaved = false;
        let savedDiaryEntries: Array<{
          title: string;
          content: string;
          date: string;
          mood: string;
          tags: string[];
        }> = [];

        const parseNormalizedDate = (rawDate?: string): string => {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const kst = new Date(utc + (9 * 3600000));
          const currentYear = String(kst.getFullYear());
          const currentMonth = String(kst.getMonth() + 1).padStart(2, '0');
          const currentDay = String(kst.getDate()).padStart(2, '0');
          const currentDateISO = `${currentYear}-${currentMonth}-${currentDay}`;
          const defaultToday = currentDateISO;

          if (!rawDate || typeof rawDate !== 'string') return defaultToday;
          const cleaned = rawDate.trim();

          // If raw date has XX or wildcard, replace with defaultToday
          if (cleaned.includes('XX') || cleaned.includes('xx') || cleaned.includes('undefined')) {
            return defaultToday;
          }

          // Full date YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
          const fullMatch = cleaned.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
          if (fullMatch) {
            const y = fullMatch[1];
            let mNum = parseInt(fullMatch[2], 10);
            let dNum = parseInt(fullMatch[3], 10);

            // If month and day are reversed like 2026-26-09 (mNum=26, dNum=9)
            if (mNum > 12 && dNum <= 12) {
              const temp = mNum;
              mNum = dNum;
              dNum = temp;
            }

            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);

            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${y}-${m}-${d}`;
          }

          // Korean format: 2026년 9월 7일
          const korFullMatch = cleaned.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
          if (korFullMatch) {
            const y = korFullMatch[1];
            let mNum = parseInt(korFullMatch[2], 10);
            let dNum = parseInt(korFullMatch[3], 10);
            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);
            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${y}-${m}-${d}`;
          }

          // Short date MM/DD or MM-DD or M월 D일 or M/D
          const shortMatch = cleaned.match(/(\d{1,2})[월.\/-]\s*(\d{1,2})[일]?/);
          if (shortMatch) {
            let mNum = parseInt(shortMatch[1], 10);
            let dNum = parseInt(shortMatch[2], 10);
            if (mNum > 12 && dNum <= 12) {
              const temp = mNum;
              mNum = dNum;
              dNum = temp;
            }
            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);

            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${currentYear}-${m}-${d}`;
          }

          return defaultToday;
        };

        const getKSTDateISO = () => {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const kst = new Date(utc + (9 * 3600000));
          const y = kst.getFullYear();
          const m = String(kst.getMonth() + 1).padStart(2, '0');
          const d = String(kst.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        const currentDateISO = getKSTDateISO();
        // Clean any placeholder anomalies in responseText
        responseText = responseText.replace(/\d{4}-\d{2}-XX/g, currentDateISO);
        responseText = responseText.replace(/2026-26-09/g, currentDateISO);

        // Stage 1: Check for [[DIARY_SAVE: ...]] JSON marker (Object or Array)
        if (responseText && responseText.includes('[[DIARY_SAVE:')) {
          const diaryMatch = responseText.match(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/);
          if (diaryMatch) {
            try {
              const rawJson = diaryMatch[1];
              const parsedData = JSON.parse(rawJson);
              const items = Array.isArray(parsedData) ? parsedData : [parsedData];

              for (const item of items) {
                if (item && (item.content || item.title)) {
                  let dTitle = item.title || '';
                  let dContent = item.content || '';
                  let dTags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ['성장일기', 'AI자동작성'];
                  let dMood = item.mood || '보람참';
                  let dDate = parseNormalizedDate(item.date);

                  if (!dTitle || dTitle.length > 15) {
                    dTitle = dTitle.replace(/^(오늘의|나만의)\s*/, '').replace(/성장\s*다이어리/g, '').replace(/[:\-]/g, '').trim();
                    if (dTitle.length > 12) dTitle = dTitle.slice(0, 12).trim();
                  }
                  if (!dTitle) dTitle = language === 'en' ? "Growth Diary" : "성장 다이어리";

                  savedDiaryEntries.push({
                    title: dTitle,
                    content: dContent,
                    date: dDate,
                    mood: dMood,
                    tags: dTags
                  });
                }
              }

              if (savedDiaryEntries.length > 0) {
                diarySaved = true;
              }
              responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
            } catch (e) {
              console.error("Failed to parse diary JSON from AI response:", e);
              responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
            }
          }
        }

        // Stage 2: Fallback parser if JSON marker was omitted, but response has date items (e.g., "📅 7/20: ... 📅 7/21: ...")
        const userAskedDiary = /다이어리|일기|적어줘|써줘|정리|각 날짜/i.test(text);
        const hasActivityDetail = /했어|갔어|땄어|배웠어|공부|실습|수상|완료|합격|정리|취득|연수|참석|수료|경험|들었어|지도|통제|부회장|학생회/i.test(text);
        const prevAiMsg = messages.filter(m => m.role === 'ai').slice(-1)[0];
        const prevWasDiaryQuestion = prevAiMsg && /어떤 일이나 배운 내용|무슨 내용을|말씀해주시면|어떤 경험/i.test(prevAiMsg.content);

        const isDiaryCreationTurn = userAskedDiary || prevWasDiaryQuestion || (hasActivityDetail && text.length >= 5);
        const isAiAskingQuestions = /어떤 일이나 배운 내용|무슨 내용을|말씀해주시면|어떤 경험이 있으셨나요/i.test(responseText);

        if (!diarySaved && isDiaryCreationTurn && !isAiAskingQuestions && responseText) {
          // Check if AI output contains date blocks e.g. "📅 7/20: ..." or "📅 7/21: ..." or "7/20:"
          const dateBlockRegex = /(?:📅|🗓️)?\s*(\d{1,2}[\/.-]\d{1,2}|\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)\s*[:\-]\s*([^\n]+(?:\n(?! (?:📅|🗓️)?\s*\d{1,2}[\/.-]\d{1,2}|\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)[^\n]+)*)/g;
          let match;
          let foundBlocks = false;

          while ((match = dateBlockRegex.exec(responseText)) !== null) {
            foundBlocks = true;
            const rawDate = match[1];
            const contentText = match[2].trim();
            const normDate = parseNormalizedDate(rawDate);

            let blockTitle = contentText.split(/[:\-.]/)[0].slice(0, 10).trim();
            if (!blockTitle) blockTitle = language === 'en' ? "Growth Diary" : "성장 다이어리";

            savedDiaryEntries.push({
              title: blockTitle,
              content: contentText,
              date: normDate,
              mood: '보람참',
              tags: ['성장일기', '각날짜별기록']
            });
          }

          if (foundBlocks && savedDiaryEntries.length > 0) {
            diarySaved = true;
          } else {
            // Single entry fallback
            const titleMatch = responseText.match(/(?:🗓️?|📅)?\s*(?:\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일|\d{4}-\d{2}-XX)?\s*(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\n]+)/i) ||
                               responseText.match(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/) ||
                               responseText.match(/(?:제목|Title)\s*[:\-]\s*([^\n]+)/i) ||
                               responseText.match(/\[오늘의\s*성장\s*다이어리\]\s*[:\-]?\s*([^\n]+)/);

            let dTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace(/[*_#]/g, '').trim() : '';
            if (!dTitle || dTitle.length > 20) {
              dTitle = dTitle.replace(/^(오늘의|나만의)\s*/, '').replace(/성장\s*다이어리/g, '').replace(/[:\-]/g, '').trim();
              if (dTitle.length > 12) dTitle = dTitle.slice(0, 12).trim();
            }

            let dTags = ['성장일기', 'AI자동작성'];
            const tagMatches = responseText.match(/#[가-힣a-zA-Z0-9_]+/g);
            if (tagMatches && tagMatches.length > 0) dTags = tagMatches.map(t => t.replace('#', ''));

            let dMood = '보람참';
            const moodMatch = responseText.match(/(?:기분|Mood)\s*[:\-]\s*([^\n📌🗓️🔥!]+)/i);
            if (moodMatch && moodMatch[1]) dMood = moodMatch[1].trim();

            const userDateMatch = text.match(/(\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)/);
            const dDate = parseNormalizedDate(userDateMatch ? userDateMatch[1] : undefined);

            let cleanedContent = responseText
              .split('\n')
              .filter(line => !line.startsWith('📌') && !line.includes('날짜:') && !line.includes('태그:'))
              .join('\n')
              .replace(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/g, '')
              .replace(/\[오늘의\s*성장\s*다이어리\]/g, '')
              .trim();

            if (cleanedContent.length > 5) {
              if (!dTitle) dTitle = language === 'en' ? "Growth Diary" : "성장 다이어리";
              savedDiaryEntries.push({
                title: dTitle.slice(0, 12),
                content: cleanedContent,
                date: dDate,
                mood: dMood,
                tags: dTags
              });
              diarySaved = true;
            }
          }
        }

        // Execute Save Action if valid diary entries obtained
        if (diarySaved && savedDiaryEntries.length > 0) {
          const savedDates: string[] = [];

          for (const entry of savedDiaryEntries) {
            await saveDiary({
              title: entry.title,
              content: entry.content,
              date: entry.date,
              mood: entry.mood,
              tags: entry.tags
            });
            if (!savedDates.includes(entry.date)) {
              savedDates.push(entry.date);
            }
          }

          const datesStr = savedDates.sort().join(', ');
          const todayDate = parseNormalizedDate();
          const isTodayOnly = savedDates.length === 1 && savedDates[0] === todayDate;

          const banner = language === 'en'
            ? `\n\n---\n✅ **Growth Diary (${datesStr}) has been automatically saved!** You can check it out in the 'Growth Diary' menu.`
            : isTodayOnly
              ? `\n\n---\n✅ **오늘의 성장 다이어리 (${datesStr})에 자동 등록되었습니다!** '성장 다이어리' 페이지에서 확인하실 수 있습니다.`
              : `\n\n---\n✅ **요청하신 각 날짜별 성장 다이어리 (${datesStr})에 각각 자동 등록되었습니다!** '성장 다이어리' 페이지에서 확인하실 수 있습니다.`;

          if (!responseText.includes('자동 등록되었습니다')) {
            responseText += banner;
          }

          window.dispatchEvent(new Event('diaryUpdated'));
        }
      }

      // Animate the text character by character (typewriter effect)
      await animateTyping(tempAiMsgId, responseText);
    } catch (err: any) {
      console.error('Chat API request failed:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiMsgId
            ? {
                ...m,
                content: language === 'en'
                  ? `⚠️ An error occurred: ${err?.message || String(err)}`
                  : `⚠️ 오류가 발생했습니다: ${err?.message || String(err)}`,
                isStreaming: false
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');

    sendMessageToAI(userText, updatedMessages);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToMessage = (id: string) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-white/10');
      setTimeout(() => {
        element.classList.remove('bg-white/10');
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col relative z-20">
      {/* 1. Sliding History Drawer Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showHistory && (
            <div className="fixed inset-0 z-[9999] flex justify-start select-none" onClick={() => setShowHistory(false)}>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Drawer Panel */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-80 max-w-[85vw] bg-slate-900/95 border-r border-white/10 h-full p-6 flex flex-col z-10 shadow-2xl backdrop-blur-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-teal-400" />
                    <span className="text-white text-[15px] font-bold">{t('이전 질문 기록', 'Previous Questions')}</span>
                    <span className="bg-teal-400/10 text-teal-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-500/10">
                      {messages.filter(m => m.role === 'user').length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 w-8 h-8 rounded-full text-[12px] font-bold cursor-pointer flex items-center justify-center transition-all active:scale-90"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {messages.filter(m => m.role === 'user').length === 0 ? (
                    <div className={`h-full flex flex-col items-center justify-center text-center ${isLightMode ? "text-slate-400" : "text-white/40"} text-[13px] p-4 gap-2`}>
                      <Sparkles size={28} className={`${isLightMode ? "text-slate-300" : "text-white/20"} animate-pulse`} />
                      <span>{t('아직 질문 기록이 없습니다.', 'No question history yet.')}</span>
                      <span className={`text-[11px] ${isLightMode ? "text-slate-400" : "text-white/30"}`}>{t('AI에게 질문을 시작해보세요!', 'Start asking questions to AI!')}</span>
                    </div>
                  ) : (
                    messages.filter(m => m.role === 'user').map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          scrollToMessage(msg.id);
                          setShowHistory(false);
                        }}
                        className="w-full text-left group flex items-start gap-2.5 p-3 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-white/70 group-hover:text-white line-clamp-2 leading-relaxed break-all font-medium transition-colors">
                            {msg.content}
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-white/20 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                      </button>
                    ))
                  )}
                </div>

                <div className={`mt-4 pt-4 border-t border-white/10 text-center text-[11px] ${isLightMode ? "text-slate-400" : "text-white/30"}`}>
                  {t('기록을 클릭하면 해당 대화로 이동합니다.', 'Click on history to jump to that conversation.')}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. MAIN CHAT PANEL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
        className={`flex-1 h-full flex flex-col p-3 sm:p-6 md:p-8 relative z-20 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border min-w-0 transition-all duration-300 ${
          isLightMode 
            ? "bg-white border-slate-200/90 shadow-xl ring-1 ring-slate-900/5" 
            : "bg-black/20 border-white/10 backdrop-blur-sm"
        }`}
      >
        {/* Chat header with control buttons */}
        <div className="flex flex-wrap sm:flex-row gap-2.5 items-center justify-between mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4 select-none shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-teal-500 animate-pulse shrink-0" />
            <span className={`text-xs sm:text-[14px] font-semibold ${isLightMode ? "text-slate-900" : "text-white/80"}`}>{t('MyStair AI 대화 분석', 'MyStair AI Chat Analysis')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className={`flex items-center justify-center gap-1.5 ${isLightMode ? "text-slate-700 bg-white hover:bg-teal-50 hover:text-indigo-700 border-slate-300 hover:border-teal-300" : "text-white/90 bg-teal-500/15 hover:bg-teal-500/25 border-teal-500/30 hover:border-teal-500/50 hover:text-white"} text-xs sm:text-[13px] font-semibold px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-full border cursor-pointer transition-all active:scale-95 shadow-sm min-h-[44px] sm:min-h-[38px]`}
              title={t('이전 질문 기록 보기', 'View previous question history')}
            >
              <History size={14} className="text-teal-400 animate-pulse shrink-0" />
              <span>{t('이전 기록', 'History')} ({messages.filter(m => m.role === 'user').length})</span>
            </button>
            <button 
              onClick={clearChat}
              className={`flex items-center justify-center gap-1.5 ${isLightMode ? "text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200" : "text-white/60 hover:text-white"} text-xs sm:text-[13px] font-medium bg-white/5 hover:bg-white/10 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-full border border-white/10 hover:border-white/25 cursor-pointer transition-all active:scale-95 shadow-sm min-h-[44px] sm:min-h-[38px]`}
              title={t('새로운 대화 시작하기', 'Start a new conversation')}
            >
              <Trash2 size={14} className="shrink-0" />
              <span>{t('새 대화 시작', 'New Chat')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 sm:space-y-8 pb-4 sm:pb-6 pr-1 sm:pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              key={msg.id} 
              id={`msg-${msg.id}`}
              className="flex w-full transition-all duration-500 rounded-3xl p-1"
            >
              <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className={`px-4 py-3 sm:px-6 sm:py-3.5 rounded-[20px] sm:rounded-[24px] rounded-tr-sm text-sm sm:text-[16px] shadow-sm max-w-[90%] sm:max-w-[80%] tracking-wide leading-relaxed font-medium ${isLightMode ? "bg-teal-600 text-white" : "bg-teal-600/90 text-white"}`}>
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-w-[95%] sm:max-w-[85%]">
                    <div className={`${isLightMode ? "text-slate-900" : "text-white"} text-sm sm:text-[16px] px-1 sm:px-2 py-1 leading-relaxed tracking-wide min-h-[44px]`}>
                      {msg.isStreaming && !msg.content ? (
                        <div className={`flex items-center gap-2 font-medium text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis ${isLightMode ? "text-teal-600" : "text-teal-300"}`}>
                          <RefreshCw size={16} className={`animate-spin shrink-0 ${isLightMode ? "text-teal-600" : "text-teal-400"}`} />
                          <span className="truncate">{t('🔍 사용자님의 자격증, 성장 다이어리, MBTI, 진로 적성검사(Holland) 데이터를 분석하여 맞춤형 인사이트를 준비 중입니다...', '🔍 Analyzing your certificates, growth diaries, MBTI, Holland test data to prepare customized insights...')}</span>
                        </div>
                      ) : (
                        <div className={`space-y-2 text-sm sm:text-base ${isLightMode ? "markdown-body-light text-slate-900 font-medium" : "markdown-body text-white"}`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!msg.isStreaming && msg.content && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-3 px-1 sm:px-2 text-sm ${isLightMode ? "text-slate-500" : "text-white/40"}`}>
                        <button className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="좋아요">
                          <ThumbsUp size={16} />
                        </button>
                        <button className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="싫어요">
                          <ThumbsDown size={16} />
                        </button>
                        <button onClick={() => handleCopyText(msg.id, msg.content)} className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="텍스트 복사">
                          {copiedId === msg.id ? <Check size={16} className="text-teal-500" /> : <Copy size={16} />}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Quick Question Suggestions - Mobile Responsive 48px touch targets */}
          {messages.length <= 2 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-3 px-1 sm:px-2">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isLightMode ? "text-slate-700" : "text-white/70"}`}>
                <Sparkles size={14} className="text-teal-400" />
                {t('추천 질의 예시', 'Suggested Questions')}
              </span>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5">
                <button 
                  onClick={() => setInputValue(t('오늘 며칠이야?', 'What is today\'s date?'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs font-semibold px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer flex items-center justify-start sm:justify-center gap-2 shadow-sm min-h-[48px] text-left sm:text-center ${isLightMode ? "text-teal-800 bg-teal-50 hover:bg-teal-100 border-teal-300" : "text-teal-300 bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40"}`}
                >
                  <span className="text-sm">📅</span> 
                  <span>"{t('오늘 며칠이야?', 'What is today\'s date?')}"</span>
                </button>
                <button 
                  onClick={() => setInputValue(t('오늘의 다이어리 써줘', 'Write today\'s diary for me'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs font-semibold px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer flex items-center justify-start sm:justify-center gap-2 shadow-sm min-h-[48px] text-left sm:text-center ${isLightMode ? "text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-300" : "text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/40"}`}
                >
                  <span className="text-sm">✍️</span> 
                  <span>"{t('오늘의 다이어리 써줘', 'Write today\'s diary for me')}"</span>
                </button>
                <button 
                  onClick={() => setInputValue(t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'What are the employment strategies and required certifications for Meister high school graduates to enter large companies?'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'Employment strategy for large companies after graduating high school?')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Analyze my growth diary and extract cover letter experiences'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Extract cover letter experiences from growth diary')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Tell me recommended job roles and companies matching my major and MBTI'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Recommended job roles and companies matching major and MBTI')}"
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="pt-3 sm:pt-4 mt-auto shrink-0">
          <form onSubmit={handleSubmit} className="w-full rounded-2xl sm:rounded-[32px] p-1.5 sm:p-2 shadow-lg border border-slate-200 bg-white flex items-center focus-within:ring-2 focus-within:ring-slate-300/60 focus-within:border-slate-300 transition-all duration-300 min-h-[52px]">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? t("AI 답변을 준비 중입니다...", "AI is preparing your answer...") : t("추가로 궁금한 점을 물어보세요", "Ask any other questions you have")}
              className="w-full bg-transparent px-3 sm:px-6 py-2 sm:py-3 outline-none text-sm sm:text-[16px] min-h-[44px] text-slate-900 placeholder-slate-400"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              aria-label="질문 제출"
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-full transition-colors shadow-md flex items-center justify-center shrink-0 ml-1.5 sm:ml-2 group cursor-pointer disabled:opacity-40 min-h-[48px] min-w-[48px] active:scale-95 bg-slate-900 hover:bg-teal-600 text-white"
            >
              <ArrowUp size={20} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

