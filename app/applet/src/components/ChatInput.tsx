import { ArrowUp, History } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInput({ onStartChat }: { onStartChat?: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { messages, setChatActive } = useChat();
  const { t } = useLanguage();
  const { isLightMode } = useTheme();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        window.innerHeight === window.screen.height
      );
      setIsFullscreen(isFs);
    };

    handleFullscreenChange();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleFullscreenChange);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && onStartChat) {
      onStartChat(message);
    }
  };

  return (
    <div className={`relative z-20 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-3 sm:px-4 transition-all duration-300 ${isFullscreen ? 'mt-32 sm:mt-48 md:mt-64' : 'mt-6 sm:mt-16 md:mt-28'}`}>
      <h1 className={`text-2xl sm:text-[40px] md:text-[56px] ${isLightMode ? "text-slate-900 drop-shadow-sm" : "text-white"} font-black mb-6 sm:mb-10 tracking-tight text-center leading-tight`}>
        MyStair <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isLightMode ? "from-teal-500 via-emerald-500 to-teal-600" : "from-teal-400 via-emerald-400 to-teal-300"}`}>{t('성장의 계단')}</span>
      </h1>

      {/* Clean White Input Box */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full rounded-2xl p-2 sm:p-2.5 bg-white border border-slate-200 shadow-xl flex items-center focus-within:ring-2 focus-within:ring-teal-500/30 transition-all duration-200 min-h-[52px]"
      >
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('나의 전공, 적성, 관심 분야에 맞는 기업을 검색하거나 추천받아보세요!')}
          className="w-full bg-transparent px-3 sm:px-4 py-2 outline-none text-sm sm:text-base font-medium min-h-[44px] text-slate-900 placeholder-slate-400"
        />

        <button 
          type="submit" 
          aria-label="질문 보내기"
          className="bg-slate-900 hover:bg-teal-600 text-white p-3 sm:p-3.5 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 group/btn ml-1.5 sm:ml-2 cursor-pointer min-h-[48px] min-w-[48px] active:scale-95"
        >
          <ArrowUp size={20} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </form>

      {/* Example Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2 mt-6 sm:mt-8 max-w-4xl mx-auto px-2">
        <button 
          onClick={() => onStartChat?.('오늘의 다이어리 작성해줘')} 
          className={`whitespace-nowrap flex-1 sm:flex-none justify-center min-h-[44px] px-4 py-2.5 rounded-xl sm:rounded-full border text-[13px] sm:text-sm transition-all font-semibold cursor-pointer flex items-center gap-1.5 active:scale-98 backdrop-blur-md ${
            isLightMode 
              ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-xs" 
              : "border-white/15 text-white/90 bg-black/40 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className="text-sm">✍️</span> 
          <span>{t('오늘의 다이어리 작성')}</span>
        </button>
        <button 
          onClick={() => onStartChat?.('내 전공과 적성에 맞는 AI 맞춤형 기업 추천해줘')} 
          className={`whitespace-nowrap flex-1 sm:flex-none justify-center min-h-[44px] px-4 py-2.5 rounded-xl sm:rounded-full border text-[13px] sm:text-sm transition-all font-semibold cursor-pointer active:scale-98 backdrop-blur-md ${
            isLightMode 
              ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-xs" 
              : "border-white/15 text-white/90 bg-black/40 hover:bg-white/10 hover:text-white"
          }`}
        >
          {t('나만의 기업찾기 (AI 맞춤 기업 추천)')}
        </button>
        <button 
          onClick={() => onStartChat?.('Mystair 서비스에 대해 자세히 자기소개해줘')} 
          className={`whitespace-nowrap flex-1 sm:flex-none justify-center min-h-[44px] px-4 py-2.5 rounded-xl sm:rounded-full border text-[13px] sm:text-sm transition-all font-semibold cursor-pointer active:scale-98 backdrop-blur-md ${
            isLightMode 
              ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-xs" 
              : "border-white/15 text-white/90 bg-black/40 hover:bg-white/10 hover:text-white"
          }`}
        >
          {t('Mystair 자기소개')}
        </button>
      </div>

      {messages.length > 0 && (
        <button 
          onClick={() => setChatActive(true)}
          className={`mt-6 sm:mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl sm:rounded-full border text-xs sm:text-sm transition-all font-semibold cursor-pointer active:scale-95 min-h-[48px] w-full sm:w-auto backdrop-blur-md ${
            isLightMode 
              ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-xs" 
              : "border-teal-500/30 text-teal-300 bg-black/50 hover:bg-teal-500/10"
          }`}
        >
          <History size={16} className="animate-pulse shrink-0 text-teal-400" />
          <span>{t('이전 대화 이어하기')} ({messages.length})</span>
        </button>
      )}
    </div>
  );
}
