import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';
import { AlienUFOSvg } from './FloatingAliens';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export interface CoverLetterAiCoachProps {
  companyName: string;
  sectionTitle: string;
  recommendedChars: number;
  currentAnswer: string;
}

interface CoachFeedback {
  speech?: string;
  summary?: string;
  tips?: string[];
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();

  // 말풍선 표시 여부 (기본: 열림 상태로 외계인이 말풍선으로 조언)
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [feedbackSpeech, setFeedbackSpeech] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');

  // 실시간 피드백 요청 (자동 디바운스)
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

  // 사용자가 자기소개서를 작성하거나 수정할 때 실시간 자동 감지
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

  // 문항 변경 시 즉시 새 문항 가이드 요청
  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    fetchFeedback(true);
  }, [sectionTitle, companyName]);

  // 기본 안내 메시지 (피드백 데이터가 아직 오기 전)
  const defaultMessage = currentAnswer.trim().length === 0
    ? t(`[${sectionTitle || '자기소개서'}] 작성할 준비가 되셨나요? 🛸 머릿속에 떠오르는 생각을 다듬지 말고 일단 편하게 첫 문장을 적어보세요. 실시간으로 읽고 보완할 점을 바로 말씀해 드릴게요!`)
    : t(`작성 중인 내용을 꼼꼼히 살펴보고 있습니다. 🛸 잠시만 기다려주시면 유용한 피드백을 들려드릴게요!`);

  const currentSpeech = feedbackSpeech || defaultMessage;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* 1. 외계인 실시간 피드백 전용 말풍선 (입력창 없이 오직 AI의 조언만 표시) */}
      {showBubble && (
        <div className="pointer-events-auto relative mb-3.5 w-[320px] sm:w-[360px] md:w-[380px] rounded-3xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 overflow-hidden">
          
          {/* 말풍선 꼬리 (외계인 머리 위를 자연스럽게 가리키는 포인터) */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200/90 dark:border-slate-700/80 transform rotate-45 pointer-events-none shadow-sm" />

          {/* 상단 미니 헤더: 외계인 뱃지 + 문항명 + 새로고침 & 닫기 */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs ${
            isLightMode ? "bg-slate-50/80 border-slate-200/70" : "bg-slate-800/60 border-slate-700/70"
          }`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[11.5px] text-emerald-600 dark:text-emerald-400">
                {t('MyStair AI 코치')}
              </span>
              {sectionTitle && (
                <span className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                  [{sectionTitle}]
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fetchFeedback(true)}
                disabled={isLoading}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                title={t('피드백 다시 받기')}
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin text-emerald-500" : ""} />
              </button>

              <button
                type="button"
                onClick={() => setShowBubble(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('말풍선 닫기')}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* 본문: 넉넉하고 읽기 편한 AI 피드백 텍스트 */}
          <div className="p-4 sm:p-5">
            {isLoading ? (
              <div className="py-2 flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-[12.5px] animate-pulse">
                <RefreshCw size={14} className="animate-spin text-emerald-500 shrink-0" />
                <span>{t('작성하신 내용을 읽고 생각을 정리하고 있어요...')}</span>
              </div>
            ) : (
              <div className="text-[13px] sm:text-[13.5px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal tracking-normal">
                {currentSpeech}
              </div>
            )}
          </div>

          {/* 하단 미니 상태 표시줄 */}
          <div className={`px-4 py-1.5 border-t text-[10px] flex items-center justify-between text-slate-400 dark:text-slate-500 ${
            isLightMode ? "bg-slate-50/50 border-slate-200/50" : "bg-slate-800/30 border-slate-700/50"
          }`}>
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-emerald-500" />
              {t('글을 작성하거나 수정하면 실시간으로 조언해드려요')}
            </span>
          </div>

        </div>
      )}

      {/* 2. 우측 하단 유영하는 외계인 UFO 캐릭터 (클릭 시 말풍선 토글) */}
      <button
        type="button"
        onClick={() => setShowBubble(!showBubble)}
        className="pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien"
        title={showBubble ? t('말풍선 숨기기') : t('MyStair AI 실시간 코칭 말풍선 보기')}
      >
        <AlienUFOSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] transition-all group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]" />
      </button>

    </div>
  );
}
