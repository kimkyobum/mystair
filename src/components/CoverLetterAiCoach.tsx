import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Lightbulb
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
  summary: string;
  praise: string;
  tips: string[];
  nextStepHint: string;
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();

  // 말풍선 표시 여부 (기본값: true - 밖에서 바로 실시간 피드백 표시)
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  
  // 질문 모드 토글
  const [isAskingMode, setIsAskingMode] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');

  // 실시간 피드백 요청 (자동 디바운스)
  const fetchFeedback = async (force: boolean = false) => {
    const trimmed = currentAnswer.trim();
    if (!force && trimmed === lastAnalyzedTextRef.current) return;
    if (trimmed.length < 10) {
      setFeedback(null);
      return;
    }

    lastAnalyzedTextRef.current = trimmed;
    setIsLoadingFeedback(true);

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
        if (data.feedback) {
          setFeedback(data.feedback);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI coaching:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  // 사용자가 타이핑할 때 밖에서 실시간으로 자동 분석
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!currentAnswer.trim() || currentAnswer.trim().length < 15) {
      setFeedback(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchFeedback();
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentAnswer, sectionTitle, companyName]);

  // 문항 변경 시 상태 초기화
  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    setLastAnswer(null);
    setIsAskingMode(false);
  }, [sectionTitle]);

  // AI에게 직접 질문하기
  const handleAskQuestion = async (queryText?: string) => {
    const query = (queryText || userQuestion).trim();
    if (!query || isAnswering) return;

    setUserQuestion('');
    setIsAnswering(true);
    setIsAskingMode(true);

    try {
      const res = await fetch('/api/cover-letter/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          sectionTitle,
          recommendedChars,
          currentAnswer,
          actionType: 'ask_question',
          userQuestion: query
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastAnswer(data.answer || t('실천 가능한 문장으로 살을 붙여보세요.'));
      } else {
        setLastAnswer(t('질문을 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.'));
      }
    } catch {
      setLastAnswer(t('네트워크 연결을 확인해주세요.'));
    } finally {
      setIsAnswering(false);
    }
  };

  // 표시할 핵심 피드백 목록 (불필요한 칭찬/진단 수식어를 빼고 간결한 개선 팁만 추출)
  const displayTips: string[] = feedback?.tips && feedback.tips.length > 0 
    ? feedback.tips.slice(0, 2)
    : [];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* 1. 예쁜 실시간 피드백 말풍선 (외부 노출형 Speech Bubble) */}
      {showBubble && (
        <div className="pointer-events-auto relative mb-3 w-[300px] sm:w-[330px] rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-700/90 text-slate-800 dark:text-slate-100 overflow-hidden">
          
          {/* 말풍선 꼬리 (외계인 방향을 정확히 가리키는 삼각형 포인터) */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200/90 dark:border-slate-700/90 transform rotate-45 pointer-events-none shadow-sm" />

          {/* 상단 헤더: 외계인 표시 + 문항명 + 컨트롤 버튼 */}
          <div className={`px-3.5 py-2 border-b flex items-center justify-between text-xs ${
            isLightMode ? "bg-slate-50/80 border-slate-200/80" : "bg-slate-800/60 border-slate-700/80"
          }`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 truncate">
                {t('MyStair AI 실시간 코칭')}
              </span>
              {sectionTitle && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                  {sectionTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fetchFeedback(true)}
                disabled={isLoadingFeedback || !currentAnswer.trim()}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                title={t('피드백 새로고침')}
              >
                <RefreshCw size={12} className={isLoadingFeedback ? "animate-spin text-emerald-500" : ""} />
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

          {/* 본문: 간결한 핵심 피드백 내용 */}
          <div className="p-3.5 text-[12px] leading-relaxed">
            
            {/* AI 답변 모드인 경우 */}
            {isAskingMode && lastAnswer ? (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>{t('외계인 코치 답변')}</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAskingMode(false)}
                    className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                  >
                    {t('피드백 보기')}
                  </button>
                </div>
                <p className="whitespace-pre-line text-slate-800 dark:text-slate-200 text-[11.5px]">
                  {lastAnswer}
                </p>
              </div>
            ) : isAnswering ? (
              <div className="py-2 flex items-center gap-2 text-slate-500 text-[11.5px] animate-pulse">
                <RefreshCw size={12} className="animate-spin text-emerald-500" />
                <span>{t('답변을 생각하고 있어요...')}</span>
              </div>
            ) : displayTips.length > 0 ? (
              /* 실시간 피드백 팁만 간결하게 표시 (잘한 점/칭찬 제외) */
              <div className="space-y-2">
                {displayTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-[13px] leading-none mt-0.5">•</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium text-[11.5px] leading-snug">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            ) : currentAnswer.trim().length > 0 ? (
              /* 작성 초기 단계 안내 */
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-[11.5px] leading-snug">
                <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  {t('첫 문장은 두괄식으로 핵심 전공 역량과 결론을 먼저 제시해보세요.')}
                </span>
              </div>
            ) : (
              /* 작성 전 기본 안내 */
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11.5px]">
                <Sparkles size={13} className="text-emerald-500 shrink-0" />
                <span>
                  {t('글을 작성하시면 실시간으로 핵심 피드백을 알려드려요!')}
                </span>
              </div>
            )}
          </div>

          {/* 하단 미니 바: 빠른 질문 버튼 및 질문 입력 필드 */}
          <div className={`px-3 py-2 border-t flex flex-col gap-1.5 ${
            isLightMode ? "bg-slate-50/60 border-slate-200/70" : "bg-slate-800/40 border-slate-700/70"
          }`}>
            {/* 원클릭 빠른 질문 */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => handleAskQuestion('지금 쓴 내용 어때?')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium shrink-0 transition-colors cursor-pointer border ${
                  isLightMode 
                    ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                {t('지금 어때?')}
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('나 뭐 써야 할지 모르겠어')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium shrink-0 transition-colors cursor-pointer border ${
                  isLightMode 
                    ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                {t('소재 추천')}
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('첫 문장 어떻게 시작할까?')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium shrink-0 transition-colors cursor-pointer border ${
                  isLightMode 
                    ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                {t('첫 문장 팁')}
              </button>
            </div>

            {/* 미니 질문 인풋 */}
            <form 
              onSubmit={e => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-1 pt-0.5"
            >
              <input
                type="text"
                value={userQuestion}
                onChange={e => setUserQuestion(e.target.value)}
                placeholder={t('외계인 코치에게 질문하기...')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-[11px] outline-none border transition-all ${
                  isLightMode 
                    ? "bg-white border-slate-200 focus:border-emerald-500 text-slate-900" 
                    : "bg-slate-900 border-slate-700 focus:border-emerald-500 text-slate-100"
                }`}
              />
              <button
                type="submit"
                disabled={isAnswering || !userQuestion.trim()}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
                title={t('질문')}
              >
                <Send size={11} />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 2. 우측 하단 유영하는 외계인 UFO 캐릭터 */}
      <button
        type="button"
        onClick={() => setShowBubble(!showBubble)}
        className="pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien"
        title={showBubble ? t('피드백 말풍선 닫기') : t('실시간 피드백 말풍선 열기')}
      >
        <AlienUFOSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] transition-all group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]" />
      </button>

    </div>
  );
}
