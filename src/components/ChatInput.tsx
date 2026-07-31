import { ArrowUp, History } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInput({ onStartChat }: { onStartChat?: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { messages, setChatActive } = useChat();
  const { t } = useLanguage();

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
    <div className={`relative z-20 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-3 sm:px-4 transition-all duration-300 ${isFullscreen ? 'mt-16 sm:mt-24 md:mt-36' : 'mt-6 sm:mt-16 md:mt-28'}`}>
      <h1 className="text-2xl sm:text-[40px] md:text-[56px] text-white font-bold mb-6 sm:mb-10 tracking-tight text-center leading-tight">
        MyStair <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{t('성장의 계단')}</span>
      </h1>
      
      <form onSubmit={handleSubmit} className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 animate-gradient rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center focus-within:ring-4 ring-purple-500/30 transition-all duration-300 relative group min-h-[52px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[20px] blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10"></div>

        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('나의 전공, 적성, 관심 분야에 맞는 기업을 검색하거나 추천받아보세요!')}
          className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-3 sm:px-4 py-2 outline-none text-sm sm:text-base font-medium min-h-[44px]"
        />
        
        <button 
          type="submit" 
          aria-label="질문 보내기"
          className="bg-black text-white p-3 sm:p-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center shrink-0 group/btn ml-1.5 sm:ml-2 cursor-pointer min-h-[48px] min-w-[48px] active:scale-95"
        >
          <ArrowUp size={20} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </form>
      
      {/* Example Action Buttons */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-6 sm:mt-8 max-w-4xl mx-auto px-2">
        <button 
          onClick={() => onStartChat?.('오늘의 다이어리 작성해줘')} 
          className="whitespace-nowrap shrink-0 min-h-[40px] px-3.5 py-2 rounded-full border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm hover:bg-emerald-500/20 hover:border-emerald-500/70 transition-all bg-emerald-500/15 backdrop-blur-md font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-98"
        >
          <span className="text-xs">✍️</span> 
          <span>{t('오늘의 다이어리 작성')}</span>
        </button>

        <button 
          onClick={() => onStartChat?.('내 전공과 적성에 맞는 대기업 및 공기업 추천해줘')} 
          className="whitespace-nowrap shrink-0 min-h-[40px] px-3.5 py-2 rounded-full border border-white/20 text-white/90 text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium cursor-pointer active:scale-98"
        >
          {t('나만의 기업찾기 (대기업/공기업 TOP 10)')}
        </button>

        <button 
          onClick={() => onStartChat?.('Mystair 서비스에 대해 자세히 자기소개해줘')} 
          className="whitespace-nowrap shrink-0 min-h-[40px] px-3.5 py-2 rounded-full border border-white/20 text-white/90 text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium cursor-pointer active:scale-98"
        >
          {t('Mystair 자기소개')}
        </button>
      </div>

      {messages.length > 0 && (
        <button 
          onClick={() => setChatActive(true)}
          className="mt-6 sm:mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl sm:rounded-full border border-teal-500/30 text-teal-300 text-xs sm:text-sm hover:bg-teal-500/10 hover:border-teal-500/50 transition-all bg-teal-500/5 backdrop-blur-md font-semibold cursor-pointer shadow-[0_0_15px_rgba(45,212,191,0.1)] active:scale-95 min-h-[48px] w-full sm:w-auto"
        >
          <History size={16} className="animate-pulse shrink-0" />
          <span>{t('이전 대화 이어하기')} ({messages.length})</span>
        </button>
      )}
    </div>
  );
}
