import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
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

  const sendMessageToAI = async (text: string, existingMessages: Message[]) => {
    setIsLoading(true);

    const tempAiMsgId = (Date.now() + 1).toString();
    
    // Add placeholder AI loading state
    setMessages((prev) => [
      ...prev,
      { id: tempAiMsgId, role: 'ai', content: '', isStreaming: true }
    ]);

    try {
      const profile = getCombinedProfileData();
      const diaries = await getCombinedDiariesData();

      // Format history for server
      const chatHistory = existingMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

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

      const data = await res.json();

      if (data.error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAiMsgId
              ? { ...m, content: `⚠️ 오류가 발생했습니다: ${data.error}`, isStreaming: false }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAiMsgId
              ? { ...m, content: data.response || '답변을 불러올 수 없습니다.', isStreaming: false }
              : m
          )
        );
      }
    } catch (err: any) {
      console.error('Chat API request failed:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiMsgId
            ? {
                ...m,
                content: '⚠️ 서버와 통신 중 연결 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
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
                      <span>MyStair AI가 DB 프로필, 다이어리 및 채용 정보를 분석 중입니다...</span>
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

