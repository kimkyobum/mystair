import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw, Trash2, MessageSquare, ArrowRight, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { useChat, Message } from '../context/ChatContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInterface() {
  const { language, t } = useLanguage();
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

  const generateClientGemini = async (text: string, profile: any, diaries: any) => {
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

    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.

[중요: 사용자의 프로필 미입력/미진단 상태 처리 지침]
- 사용자의 MBTI, 홀랜드 적성검사, 전공, 학교 등이 '미진단' 또는 '미입력'으로 되어 있다면, 이전 데이터나 기본값을 임의로 지어내며 MBTI(예: ISTJ 등)나 적성 코드가 원래 적혀있었다고 아는 척하지 마라.
- 만약 사용자가 "나 MBTI/홀랜드 안 적어놨는데 뭐야?", "마이페이지 안 적었는데 알고 있네?" 하고 묻는다면:
  "아 미안해! 사용자님의 마이페이지 프로필이 아직 작성되지 않은 미진단/미입력 상태네요! 😅 마이페이지에서 MBTI와 진로 적성검사, 전공을 입력해 주시면 딱 맞는 기업과 자격증을 추천해 드릴게요!" 하고 아는 척했던 오류를 정정하고 솔직하며 친절하게 대답해줘.

[오늘의 성장 다이어리 자동 작성 및 저장 기능]
- 사용자가 "오늘의 다이어리 써줘", "오늘 일기 적어줘", "다이어리에 ~내용 적어줘"라고 요청하거나 하루 동안의 경험/학습을 다이어리에 작성해 달라고 한 경우:
  1) 사용자가 오늘 있었던 일의 내용을 구체적으로 알려주지 않고 단지 "오늘의 다이어리 써줘" 하고 질문한 경우:
     "오늘 어떤 일이나 배운 내용이 있으셨나요? 🌿\n\n'오늘 전기기능사 실습하고 정리했어' 처럼 있었던 일을 간단히 말씀해주시면, 깔끔한 성장 다이어리로 다듬어서 오늘 자 일기에 자동으로 작성해 드릴게요! 😊" 처럼 친근하게 무슨 내용을 쓸지 물어봐.
  2) 사용자가 오늘 있었던 내용/경험을 입력해 주었거나 특정 내용을 작성해달라고 한 경우:
     - **제목 작성 규칙 (매우 중요)**: 제목을 장황한 문장으로 적지 말고 핵심 명사/키워드 포인트만 1~3단어로 매우 간결하게 적어줘! (예: "다독상 땄어" -> "다독상", "전기기능사 실습했어" -> "전기기능사 실습", "독후감 제출 완료" -> "독후감 제출")
     - **본문 작성 규칙 (매우 중요)**: 전달받은 내용을 너무 길고 과하게 부풀리지 마라! 부담스럽지 않게 사용자의 경험을 자연스럽고 깔끔하게 **살짝만 가다듬은 2~3문장 이내**의 편안한 어조로 작성해줘.
     - 그리고 **답변 제일 마지막 줄에 반드시 아래 형태의 JSON 마커**를 정확히 포함시켜줘 (시스템이 사용자의 오늘 다이어리 저장소에 자동으로 등록함):
     [[DIARY_SAVE: {"title": "핵심포인트제목", "content": "부담없이 2~3문장으로 깔끔히 작성된 다이어리 본문", "tags": ["태그1", "태그2"], "mood": "보람참"}]]

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

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${text}`,
          },
        ],
      },
    ];

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
          responseText = await generateClientGemini(text, profile, diaries);
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

      // Dual-Stage Automatic Diary Saver
      let diarySaved = false;
      let diaryTitle = '';
      let diaryContent = '';
      let diaryTags: string[] = ['성장일기', 'AI자동작성'];
      let diaryMood = '보람참';

      // Stage 1: Check for [[DIARY_SAVE: ...]] JSON marker
      if (responseText && responseText.includes('[[DIARY_SAVE:')) {
        const diaryMatch = responseText.match(/\[\[DIARY_SAVE:\s*({[\s\S]*?})\s*\]\]/);
        if (diaryMatch) {
          try {
            const rawJson = diaryMatch[1];
            const diaryData = JSON.parse(rawJson);
            diaryTitle = diaryData.title || '';
            diaryContent = diaryData.content || '';
            if (Array.isArray(diaryData.tags) && diaryData.tags.length > 0) diaryTags = diaryData.tags;
            if (diaryData.mood) diaryMood = diaryData.mood;
            diarySaved = true;
            responseText = responseText.replace(/\[\[DIARY_SAVE:\s*{[\s\S]*?}\s*\]\]/g, '').trim();
          } catch (e) {
            console.error("Failed to parse diary JSON from AI response:", e);
            responseText = responseText.replace(/\[\[DIARY_SAVE:\s*{[\s\S]*?}\s*\]\]/g, '').trim();
          }
        }
      }

      // Stage 2: Fallback parser if JSON marker was omitted, but user asked for diary creation/summary
      const userAskedDiary = /다이어리|일기|적어줘|써줘|정리/i.test(text);
      const isAiAskingQuestions = /어떤 일이나 배운 내용|무슨 내용을|말씀해주시면/i.test(responseText);

      if (!diarySaved && userAskedDiary && !isAiAskingQuestions && responseText) {
        // Try extracting title from AI markdown output
        const titleMatch = responseText.match(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/) ||
                           responseText.match(/(?:제목|Title)\s*[:\-]\s*([^\n]+)/i) ||
                           responseText.match(/\[오늘의\s*성장\s*다이어리\]\s*[:\-]?\s*([^\n]+)/);

        if (titleMatch && titleMatch[1]) {
          diaryTitle = titleMatch[1].trim();
        }

        // Extract hashtag tags if present
        const tagMatches = responseText.match(/#[가-힣a-zA-Z0-9_]+/g);
        if (tagMatches && tagMatches.length > 0) {
          diaryTags = tagMatches.map(t => t.replace('#', ''));
        }

        // Extract mood if present
        const moodMatch = responseText.match(/(?:기분|Mood)\s*[:\-]\s*([^\n📌🗓️🔥!]+)/i);
        if (moodMatch && moodMatch[1]) {
          diaryMood = moodMatch[1].trim();
        }

        // Clean body content by stripping meta header lines
        let cleanedContent = responseText
          .split('\n')
          .filter(line => !line.startsWith('🗓️') && !line.startsWith('📌') && !line.startsWith('🔥') && !line.includes('날짜:') && !line.includes('태그:') && !line.includes('기분:'))
          .join('\n')
          .replace(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/g, '')
          .replace(/\[오늘의\s*성장\s*다이어리\]/g, '')
          .trim();

        if (cleanedContent.length > 5) {
          diaryContent = cleanedContent;
          diarySaved = true;
        }
      }

      // Execute Save Action if valid diary data obtained
      if (diarySaved && diaryContent) {
        // Ensure title is short keypoint only (e.g., 1~3 words)
        let shortTitle = diaryTitle.replace(/^(오늘의|나만의)\s*/, '').replace(/성장\s*다이어리/g, '').replace(/[:\-]/g, '').trim();
        if (shortTitle.includes('다독상')) shortTitle = '다독상';
        else if (shortTitle.includes('반도체')) shortTitle = '반도체 후공정';
        else if (shortTitle.length > 10) {
          shortTitle = shortTitle.slice(0, 10).trim();
        }
        if (!shortTitle) shortTitle = language === 'en' ? "Growth Diary" : "성장 다이어리";

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const diaryToSave = {
          title: shortTitle,
          content: diaryContent,
          date: todayStr,
          mood: diaryMood,
          tags: diaryTags
        };

        await saveDiary(diaryToSave);

        const banner = language === 'en'
          ? `\n\n---\n✅ **Today's Growth Diary (${todayStr}) has been automatically saved!** You can check it out in the 'Growth Diary' menu.`
          : `\n\n---\n✅ **오늘의 성장 다이어리 (${todayStr})에 자동 등록되었습니다!** '성장 다이어리' 페이지에서 확인하실 수 있습니다.`;

        if (!responseText.includes('자동 등록되었습니다')) {
          responseText += banner;
        }

        window.dispatchEvent(new Event('diaryUpdated'));
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
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/40 text-[13px] p-4 gap-2">
                      <Sparkles size={28} className="text-white/20 animate-pulse" />
                      <span>{t('아직 질문 기록이 없습니다.', 'No question history yet.')}</span>
                      <span className="text-[11px] text-white/30">{t('AI에게 질문을 시작해보세요!', 'Start asking questions to AI!')}</span>
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

                <div className="mt-4 pt-4 border-t border-white/10 text-center text-[11px] text-white/30">
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
        className="flex-1 h-full flex flex-col p-6 sm:p-8 relative z-20 bg-[#050505]/45 backdrop-blur-md rounded-[40px] border border-white/20 min-w-0"
      >
        {/* Chat header with control buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6 border-b border-white/10 pb-4 select-none shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            <span className="text-white/70 text-[14px] font-semibold">{t('MyStair AI 대화 분석', 'MyStair AI Chat Analysis')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-semibold bg-teal-500/10 hover:bg-teal-500/20 px-3.5 py-1.5 rounded-full border border-teal-500/20 hover:border-teal-500/45 cursor-pointer transition-all active:scale-95 shadow-sm"
              title={t('이전 질문 기록 보기', 'View previous question history')}
            >
              <History size={13} className="text-teal-400 animate-pulse" />
              <span>{t('이전 기록', 'History')} ({messages.filter(m => m.role === 'user').length})</span>
            </button>
            <button 
              onClick={clearChat}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-[13px] font-medium bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/25 cursor-pointer transition-all active:scale-95 shadow-sm"
              title={t('새로운 대화 시작하기', 'Start a new conversation')}
            >
              <Trash2 size={13} />
              <span>{t('새 대화 시작', 'New Chat')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 pb-6 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                  <div className="bg-[#e4e4e7] text-gray-800 px-6 py-3.5 rounded-[24px] rounded-tr-lg text-[16px] shadow-sm max-w-[80%] tracking-wide">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-w-[85%]">
                    <div className="text-white text-[16px] px-2 py-2 leading-relaxed tracking-wide min-h-[44px]">
                      {msg.isStreaming && !msg.content ? (
                        <div className="flex items-center gap-2 text-purple-300 font-medium">
                          <RefreshCw size={16} className="animate-spin text-purple-400" />
                          <span>{t('MyStair AI가 프로필과 다이어리를 바탕으로 나만의 기업을 탐색 중입니다...', 'MyStair AI is exploring matching companies based on your profile and diary...')}</span>
                        </div>
                      ) : (
                        <div className="markdown-body space-y-2 text-white">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!msg.isStreaming && msg.content && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 px-2 text-white/40 text-sm">
                        <ThumbsUp size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
                        <ThumbsDown size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
                        <button onClick={() => handleCopyText(msg.id, msg.content)} className="flex items-center gap-1 cursor-pointer hover:text-white/80 transition-colors">
                          {copiedId === msg.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                        <MoreHorizontal size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Quick Question Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-3 px-2">
              <span className="text-[12px] font-medium text-white/50 flex items-center gap-1.5">
                <Sparkles size={14} />
                {t('추천 질의 예시', 'Suggested Questions')}
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => setInputValue(t('오늘의 다이어리 써줘', 'Write today\'s diary for me'))} 
                  className="text-[12px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 font-semibold px-4 py-2 rounded-full transition-all active:scale-95 border border-emerald-500/40 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>✍️</span> "{t('오늘의 다이어리 써줘', 'Write today\'s diary for me')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'What are the employment strategies and required certifications for Meister high school graduates to enter large companies?'))} 
                  className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
                >
                  "{t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'Employment strategy for large companies after graduating high school?')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Analyze my growth diary and extract cover letter experiences'))} 
                  className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
                >
                  "{t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Extract cover letter experiences from growth diary')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Tell me recommended job roles and companies matching my major and MBTI'))} 
                  className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
                >
                  "{t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Recommended job roles and companies matching major and MBTI')}"
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 mt-auto shrink-0">
          <form onSubmit={handleSubmit} className="w-full bg-white rounded-[32px] p-2 shadow-sm border border-gray-200 flex items-center focus-within:ring-2 ring-purple-400/30 transition-all duration-300">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? t("AI 답변을 준비 중입니다...", "AI is preparing your answer...") : t("추가로 궁금한 점을 물어보세요", "Ask any other questions you have")}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 px-6 py-3 outline-none text-[16px]"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="bg-black text-white p-3.5 rounded-full hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center shrink-0 ml-2 group cursor-pointer disabled:opacity-40"
            >
              <ArrowUp size={20} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

