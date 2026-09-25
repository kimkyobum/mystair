import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { AlienUFOSvg } from './FloatingAliens';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export interface CoverLetterAiCoachProps {
  companyName: string;
  sectionTitle: string;
  recommendedChars: number;
  currentAnswer: string;
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();

  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [feedbackSpeech, setFeedbackSpeech] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');

  const fetchFeedback = async (force: boolean = false) => {
    const trimmed = (currentAnswer || '').trim();
    if (!force && trimmed === lastAnalyzedTextRef.current) return;

    lastAnalyzedTextRef.current = trimmed;
    setIsLoading(true);

    try {
      const res = await fetch('/api/cover-letter/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          sectionTitle,
          recommendedChars,
          currentAnswer: trimmed,
          actionType: 'realtime_feedback'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const speech = data?.feedback?.speech || data?.feedback?.summary || (data?.feedback?.tips && data.feedback.tips[0]) || '';
        if (speech) {
          setFeedbackSpeech(speech);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI coaching:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchFeedback();
    }, 1200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentAnswer, sectionTitle, companyName]);

  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    fetchFeedback(true);
  }, [sectionTitle, companyName]);

  const defaultMessage = currentAnswer.trim().length === 0
    ? t(`머릿속에 떠오르는 생각을 다듬지 말고 일단 편하게 적어보세요! 실시간으로 읽고 보완할 점을 바로 짚어드릴게요. 🛸`)
    : t(`작성하신 내용을 살펴보고 있어요! 잠시만 기다려주세요.`);

  const messageText = feedbackSpeech || defaultMessage;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* 가이드 때처럼 순수하게 피드백 내용만 담긴 깔끔한 말풍선 */}
      {showBubble && (
        <div 
          className={`pointer-events-auto relative mb-3 p-4 sm:p-4.5 rounded-2xl rounded-br-xs shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-[320px] sm:max-w-[360px] ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-300/40" 
              : "bg-slate-900 text-slate-100 border-slate-700/90 shadow-black/60"
          }`}
        >
          {/* 말풍선 꼬리 (하단 외계인을 향하는 꼬리 포인터) */}
          <div 
            className={`absolute -bottom-1.5 right-6 w-3.5 h-3.5 transform rotate-45 border-r border-b ${
              isLightMode 
                ? "bg-white border-slate-200/90" 
                : "bg-slate-900 border-slate-700/90"
            }`} 
          />

          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-0.5">
              <RefreshCw size={12} className="animate-spin text-emerald-500 shrink-0" />
              <span>{t('작성 내용을 읽고 있어요...')}</span>
            </div>
          ) : (
            <p className="text-[13px] sm:text-[13.5px] leading-relaxed font-medium whitespace-pre-line tracking-tight">
              {messageText}
            </p>
          )}
        </div>
      )}

      {/* 우측 하단 외계인 캐릭터 (클릭 시 말풍선 토글) */}
      <button
        type="button"
        onClick={() => setShowBubble(!showBubble)}
        className="pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien"
        title={showBubble ? t('말풍선 숨기기') : t('말풍선 보기')}
      >
        <AlienUFOSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] transition-all group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]" />
      </button>

    </div>
  );
}
