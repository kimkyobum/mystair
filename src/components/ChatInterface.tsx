import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

function TypewriterMessage({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    setIsTyping(true);
    setDisplayedText('');
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
      }
    }, 40);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-purple-400 animate-pulse align-middle rounded-full" />}
    </span>
  );
}

function AIMessageBubble({ msg, setInputValue }: { msg: Message, setInputValue: (v: string) => void }) {
  const [isTyping, setIsTyping] = useState(true);

  return (
    <div className="flex flex-col gap-3 max-w-[80%]">
      <div className="text-white text-[16px] px-2 py-2 leading-relaxed tracking-wide min-h-[44px]">
        <TypewriterMessage text={msg.content} onComplete={() => setIsTyping(false)} />
      </div>
      
      {!isTyping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 px-2 text-white/40">
          <ThumbsUp size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
          <ThumbsDown size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
          <Copy size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
          <MoreHorizontal size={18} className="cursor-pointer hover:text-white/80 transition-colors" />
        </motion.div>
      )}

      {!isTyping && msg.id === '2' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-3 px-2">
          <span className="text-[12px] font-medium text-white/50 flex items-center gap-1.5">
            <Sparkles size={14} />
            채팅 예시
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => setInputValue('마이스터고 졸업 후 대기업 취업 전략은?')} className="text-[12px] text-white/60 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all active:scale-95 border border-white/10">
              "마이스터고 졸업 후 대기업 취업 전략은?"
            </button>
            <button onClick={() => setInputValue('내 성향에 맞는 IT 직무 추천해줘')} className="text-[12px] text-white/60 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all active:scale-95 border border-white/10">
              "내 성향에 맞는 IT 직무 추천해줘"
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ChatInterface({ initialMessage }: { initialMessage: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'user', content: initialMessage },
    { id: '2', role: 'ai', content: `"${initialMessage}"에 대해 궁금하시군요! 마이스터고 학생을 위한 맞춤형 답변을 준비 중입니다...` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: '마이스터고 특성에 맞춘 추가 정보를 찾고 있어요. 더 궁금한 점이 있으신가요?' 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
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
              <AIMessageBubble msg={msg} setInputValue={setInputValue} />
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 mt-auto">
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-[32px] p-2 shadow-sm border border-gray-200 flex items-center focus-within:ring-2 ring-purple-400/30 transition-all duration-300">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="추가로 궁금한 점을 물어보세요"
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 px-6 py-3 outline-none text-[16px]"
          />
          <button type="submit" className="bg-black text-white p-3.5 rounded-full hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center shrink-0 ml-2 group">
            <ArrowUp size={20} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
