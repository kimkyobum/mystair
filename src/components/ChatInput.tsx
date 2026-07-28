import { ArrowUp } from 'lucide-react';
import React, { useState } from 'react';

export default function ChatInput({ onStartChat }: { onStartChat?: (msg: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && onStartChat) {
      onStartChat(message);
    }
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-20 md:mt-32 px-4">
      <h1 className="text-[40px] md:text-[56px] text-white font-bold mb-12 tracking-tight text-center leading-tight">
        MyStair <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">성장의 계단</span>
      </h1>
      
      <form onSubmit={handleSubmit} className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 animate-gradient rounded-2xl p-2.5 shadow-2xl flex items-center focus-within:ring-4 ring-purple-500/30 transition-all duration-300 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[20px] blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10"></div>

        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="관심 있는 직무나 취득하고 싶은 자격증에 대해 물어보세요"
          className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-2 outline-none text-base font-medium"
        />
        
        <button type="submit" className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center shrink-0 group/btn ml-2">
          <ArrowUp size={22} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </form>
      
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button onClick={() => onStartChat?.('프론트엔드 로드맵')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium">
          프론트엔드 로드맵
        </button>
        <button onClick={() => onStartChat?.('정보처리기능사 준비')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium">
          정보처리기능사 준비
        </button>
        <button onClick={() => onStartChat?.('요즘 뜨는 IT 기업')} className="px-5 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 hover:border-white/40 hover:text-white transition-all bg-white/5 backdrop-blur-md font-medium">
          요즘 뜨는 IT 기업
        </button>
      </div>
    </div>
  );
}
