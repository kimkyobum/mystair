import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export default function ChatInterface({ initialMessage }: { initialMessage: string }) {
  const { userProfile: firestoreProfile, fetchDiaries } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'user', content: initialMessage },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial call on mount
  useEffect(() => {
    if (initialMessage && messages.length === 1) {
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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
    if (!apiKey) {
      throw new Error('Vercel/Render 환경변수 설정에서 VITE_GEMINI_API_KEY 또는 GEMINI_API_KEY를 설정해주셔야 AI 응답이 가능합니다.');
    }

    const ai = new GoogleGenAI({ apiKey });
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
사용자가 입력창에 물어본 질문: "${text}"

제공된 [사용자 DB 프로필 데이터]와 [성장 다이어리 데이터]를 종합 분석하고, 위 공공/민간 포털 사이트들의 실제 채용 데이터와 자격증 기준을 조합하여
반드시 깔끔하고 보기 쉬운 마크다운(#, ##, ###, -, **강조** 등)과 직관적인 이모지를 사용하여 아래 5가지 필수 구조로 정성껏 대답해줘:

1. 🎯 **맞춤 추천 직무 (Job Roles)**
2. 🏢 **취업 가능 추천 기업 (Target Companies)**
3. ⚡ **더 갖추어야 할 직무 역량 (Required Skill Enhancements)**
4. 📖 **성장다이어리 경험 추출 (자기소개서/면접 맞춤 활용)**
5. 💡 **MyStair 맞춤형 취업 Action Plan**

친절하고 따뜻하며, 학생에게 커다란 동기부여와 실질적인 도움을 주는 전문적인 한국어로 응답해줘.
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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "답변을 생성하지 못했습니다.";
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
          responseText = `⚠️ AI 설정 안내:\n\nVercel 또는 Render 환경 변수(Environment Variables)에 **VITE_GEMINI_API_KEY** 또는 **GEMINI_API_KEY**를 추가 등록해주시면 AI 응답이 작동합니다.\n\n(상세 원인: ${clientErr?.message || String(clientErr)})`;
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiMsgId
            ? { ...m, content: responseText, isStreaming: false }
            : m
        )
      );
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
                      <span>MyStair AI가 프로필, 다이어리 및 채용 정보를 분석 중입니다...</span>
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

