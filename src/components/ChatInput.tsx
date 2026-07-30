import { ArrowUp, History } from 'lucide-react';
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInput({ onStartChat }: { onStartChat?: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  const { messages, setChatActive } = useChat();
  const { t } = useLanguage();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && onStartChat) {
      onStartChat(message);
    }
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-20 md:mt-32 px-4">
      <h1 className="text-[40px] md:text-[56px] text-white font-bold mb-12 tracking-tight text-center leading-tight">
        MyStair <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{t('성장의 계단')}</span>
      </h1>
      
      <form onSubmit={handleSubmit} className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 animate-gradient rounded-2xl p-2.5 shadow-2xl flex items-center focus-within:ring-4 ring-purple-500/30 transition-all duration-300 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[20px] blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10"></div>

        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('나의 전공, 적성, 관심 분야에 맞는 기업을 검색하거나 추천받아보세요!')}
          className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-2 outline-none text-base font-medium"
        />
        
        <button type="submit" className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center shrink-0 group/btn ml-2 cursor-pointer">
          <ArrowUp size={22} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </form>
      
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button onClick={() => onStartChat?.('내 MBTI와 홀랜드검사, 학교, 전공등을 분석하여 회사 데이터를 기반으로 대기업 10곳과 공기업 10곳 차례대로 추천해줘')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium cursor-pointer">
          {t('나만의 기업찾기 (대기업/공기업 TOP 10)')}
        </button>
        <button onClick={() => onStartChat?.('마이스터고 학생들이 많이 가는 대표 대기업/공기업')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium cursor-pointer">
          {t('대표 대기업 & 공기업 리스트')}
        </button>
        <button onClick={() => onStartChat?.('내 성장기록(다이어리) 바탕으로 가기 좋은 우수 중견기업 추천')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium cursor-pointer">
          {t('성장기록 기반 우수 기업 매칭')}
        </button>
      </div>

      {messages.length > 0 && (
        <button 
          onClick={() => setChatActive(true)}
          className="mt-8 flex items-center gap-2 px-6 py-2.5 rounded-full border border-teal-500/30 text-teal-300 text-sm hover:bg-teal-500/10 hover:border-teal-500/50 transition-all bg-teal-500/5 backdrop-blur-md font-semibold cursor-pointer shadow-[0_0_15px_rgba(45,212,191,0.1)] active:scale-95"
        >
          <History size={14} className="animate-pulse" />
          <span>{t('이전 대화 이어하기')} ({messages.length})</span>
        </button>
      )}
    </div>
  );
}
