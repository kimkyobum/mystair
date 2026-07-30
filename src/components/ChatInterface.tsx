import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { useChat, Message } from '../context/ChatContext';

export default function ChatInterface() {
  const { userProfile: firestoreProfile, fetchDiaries } = useAuth();
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
      name: firestoreProfile?.name || '마이스터 인재',
      highSchool: firestoreProfile?.highSchool || '수도전기공업고등학교',
      major: firestoreProfile?.major || '전기제어과',
      mbti: firestoreProfile?.mbti || 'ISTJ',
      hollandCode: firestoreProfile?.hollandCode || 'RC',
      targetCompanies: firestoreProfile?.targetCompanies || ['한국전력공사', '삼성전자', '현대자동차', '한화시스템']
    };

    try {
      const savedMyPage = localStorage.getItem('mystair_mypage_data');
      if (savedMyPage) {
        const parsed = JSON.parse(savedMyPage);
        profile = {
          ...profile,
          ...parsed,
          name: parsed.name || profile.name,
          highSchool: parsed.highSchool || profile.highSchool,
          major: parsed.major || profile.major,
          mbti: parsed.mbti || profile.mbti,
          hollandCode: parsed.hollandCode || profile.hollandCode,
          targetCompanies: parsed.targetCompanies || profile.targetCompanies
        };
      }
    } catch (e) {
      console.error('Error parsing local mypage data:', e);
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
        const savedDiaries = localStorage.getItem('mystair_diaries');
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
- 이름: ${profile.name || "미설정"}
- 학교 및 전공: ${profile.highSchool || "마이스터고"} / ${profile.major || "전공학과"}
- MBTI 성격유형: ${profile.mbti || "미진단"}
- 홀랜드 진로적성: ${profile.hollandCode || "미진단"}
- 희망/관심 기업: ${
          Array.isArray(profile.targetCompanies) && profile.targetCompanies.length > 0
            ? profile.targetCompanies.join(", ")
            : "삼성전자, 한국전력공사, 현대자동차, 한화시스템"
        }
`
      : "[사용자 프로필 미입력 - 마이스터고/특성화고 표준 모범 프로필 기준으로 맞춤 응답]";

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
너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.

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
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });

          console.log(`Client direct direct API call succeeded using key index ${keyIndex} with model ${modelName}`);
          return response.text || "답변을 생성하지 못했습니다.";
        } catch (err: any) {
          console.warn(`Client direct API key index ${keyIndex} failed with model ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }
    }

    throw lastError || new Error("모든 클라이언트 Gemini API 키 및 모델 호출이 실패했습니다.");
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
            diaries: diaries
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
            responseText = "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 바로 답변해 드릴게요! 😊";
          } else {
            responseText = `⚠️ AI 설정 안내:\n\nVercel 또는 Render 환경 변수(Environment Variables)에 **VITE_GEMINI_API_KEY** 또는 **GEMINI_API_KEY**를 추가 등록해주시면 AI 응답이 작동합니다.\n\n(상세 원인: ${errStr})`;
          }
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
                content: `⚠️ 오류가 발생했습니다: ${err?.message || String(err)}`,
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className="w-full h-full max-w-4xl mx-auto flex flex-col p-6 sm:p-8 relative z-20 bg-transparent rounded-[40px] border border-white/20"
    >
      {/* Chat header with reset button */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 select-none">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          <span className="text-white/70 text-[14px] font-semibold">MyStair AI 대화 분석</span>
        </div>
        <button 
          onClick={clearChat}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-[13px] font-medium bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/25 cursor-pointer transition-all active:scale-95 shadow-sm"
          title="새로운 대화 시작하기"
        >
          <Trash2 size={13} />
          <span>새 대화 시작</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 pb-6 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
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
                      <span>MyStair AI가 프로필과 다이어리를 바탕으로 나만의 기업을 탐색 중입니다...</span>
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
          </motion.div>
        ))}

        {/* Quick Question Suggestions */}
        {messages.length <= 2 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-3 px-2">
            <span className="text-[12px] font-medium text-white/50 flex items-center gap-1.5">
              <Sparkles size={14} />
              추천 질의 예시
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => setInputValue('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?')} 
                className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
              >
                "마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?"
              </button>
              <button 
                onClick={() => setInputValue('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘')} 
                className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
              >
                "내 성장 다이어리를 분석해서 자소서 경험 뽑아줘"
              </button>
              <button 
                onClick={() => setInputValue('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘')} 
                className="text-[12px] text-white/80 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all active:scale-95 border border-white/10 cursor-pointer"
              >
                "내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘"
              </button>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 mt-auto">
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-[32px] p-2 shadow-sm border border-gray-200 flex items-center focus-within:ring-2 ring-purple-400/30 transition-all duration-300">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "AI 답변을 준비 중입니다..." : "추가로 궁금한 점을 물어보세요"}
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
  );
}

