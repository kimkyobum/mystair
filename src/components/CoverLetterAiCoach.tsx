import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  Lightbulb, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Minimize2,
  Maximize2
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

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

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
          setShowSpeechBubble(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI coaching:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  // 사용자가 타이핑 멈출 때 2초 후 실시간 자동 분석
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
    }, 2200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentAnswer, sectionTitle, companyName]);

  // 문항이 바뀔 때 분석 대상 초기화
  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    setChatHistory([]);
  }, [sectionTitle]);

  // AI에게 직접 질문하기 (노션 AI 스타일 질의응답)
  const handleAskQuestion = async (queryText?: string) => {
    const query = (queryText || userQuestion).trim();
    if (!query || isAsking) return;

    setUserQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsAsking(true);

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
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'ai', 
            text: data.answer || t('실천 가능한 문장으로 살을 붙여보세요!') 
          }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'ai', 
            text: t('질문을 처리하는 도중 일시적인 문제가 발생했습니다. 잠시 후 다시 질문해주세요.') 
          }
        ]);
      }
    } catch {
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'ai', 
          text: t('네트워크 연결을 확인해주세요.') 
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // 빠른 코칭 질문 클릭
  const handleQuickPrompt = (prompt: string) => {
    handleAskQuestion(prompt);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* 1. Speech Bubble (when panel is closed or floating) */}
      {!isOpen && showSpeechBubble && (
        <div className="pointer-events-auto mb-2 mr-1 max-w-[280px] sm:max-w-[320px] bg-white dark:bg-slate-900 border border-emerald-400/80 dark:border-emerald-500/80 rounded-2xl p-3 shadow-2xl relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={() => setShowSpeechBubble(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={13} />
          </button>
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">🛸</span>
            <div className="text-xs text-slate-800 dark:text-slate-100 pr-3">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                {feedback ? t('외계인 AI 코치의 실시간 팁') : t('MyStair AI 코치')}
              </p>
              <p className="leading-relaxed line-clamp-3 text-[11.5px]">
                {feedback ? feedback.summary : t('자기소개서를 쓰면 제가 실시간으로 읽고 보조해 드려요! 언제든 클릭해주세요.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setShowSpeechBubble(false);
            }}
            className="mt-2 w-full py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-center transition-colors cursor-pointer"
          >
            {t('실시간 코칭 열기 ↗')}
          </button>
        </div>
      )}

      {/* 2. Expanded Real-Time Coach Card */}
      {isOpen && (
        <div 
          className={`pointer-events-auto mb-3 w-[330px] sm:w-[380px] rounded-3xl shadow-2xl border transition-all flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isLightMode 
              ? "bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-900" 
              : "bg-slate-900/95 backdrop-blur-md border-slate-700/90 text-slate-100"
          } ${isMinimized ? "h-auto" : "max-h-[560px]"}`}
        >
          {/* Card Header */}
          <div className={`p-3.5 border-b flex items-center justify-between gap-2 ${
            isLightMode ? "bg-emerald-50/80 border-slate-100" : "bg-emerald-950/40 border-slate-800"
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/40">
                <AlienUFOSvg className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate">
                    {t('MyStair 외계인 AI 코치')}
                  </h4>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {sectionTitle ? `[${sectionTitle}]` : t('문항 실시간 관찰 중')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fetchFeedback(true)}
                disabled={isLoadingFeedback || !currentAnswer.trim()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                title={t('지금 작성 내용 다시 분석하기')}
              >
                <RefreshCw size={13} className={isLoadingFeedback ? "animate-spin text-emerald-500" : ""} />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? t('펼치기') : t('접기')}
              >
                {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('닫기')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Card Body (Scrollable) */}
          {!isMinimized && (
            <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs flex-1">
              
              {/* Status / Loading Badge */}
              {isLoadingFeedback && (
                <div className="flex items-center justify-center gap-2 p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-[11px] animate-pulse">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>{t('작성 중인 문장을 실시간으로 읽고 있어요...')}</span>
                </div>
              )}

              {/* Real-time Feedback Section */}
              {feedback ? (
                <div className="space-y-2.5">
                  {/* Summary / Core Advice */}
                  <div className={`p-3 rounded-2xl border ${
                    isLightMode ? "bg-slate-50 border-slate-200/80" : "bg-slate-800/60 border-slate-700/80"
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">🛸</span>
                      <div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-[11.5px] mb-1">
                          {t('외계인 코치의 한 줄 진단')}
                        </div>
                        <p className="text-[11.5px] leading-relaxed font-medium">
                          {feedback.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Praise / Strong Points */}
                  {feedback.praise && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11.5px]">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span>{t('잘하고 있는 점')}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 pl-4 leading-relaxed">
                        {feedback.praise}
                      </p>
                    </div>
                  )}

                  {/* Improvement Tips */}
                  {feedback.tips && feedback.tips.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Lightbulb size={12} className="text-amber-500" />
                        <span>{t('실시간 개선 포인트')}</span>
                      </div>
                      {feedback.tips.map((tip, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded-xl border text-[11px] leading-relaxed flex items-start gap-1.5 ${
                            isLightMode ? "bg-amber-50/50 border-amber-200/60 text-slate-700" : "bg-amber-950/20 border-amber-800/40 text-slate-300"
                          }`}
                        >
                          <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Step Hint */}
                  {feedback.nextStepHint && (
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      isLightMode ? "bg-sky-50/60 border-sky-200/80 text-sky-900" : "bg-sky-950/30 border-sky-800/60 text-sky-200"
                    }`}>
                      <span className="font-bold text-sky-600 dark:text-sky-400 mr-1.5">🚀 {t('다음 추천 흐름')}:</span>
                      <span className="leading-relaxed">{feedback.nextStepHint}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state when user hasn't written much yet */
                <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                  isLightMode ? "bg-slate-50/60 border-slate-200" : "bg-slate-800/40 border-slate-700"
                }`}>
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <AlienUFOSvg className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-[12px] text-slate-700 dark:text-slate-200">
                    {t('글을 작성하면 실시간 피드백이 시작돼요!')}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t('문장을 입력하시면 외계인 코치가 실시간으로 읽고 보완점과 칭찬을 짚어드립니다.')}
                  </p>
                </div>
              )}

              {/* Chat / Interaction History */}
              {chatHistory.length > 0 && (
                <div className="space-y-2 border-t pt-2.5 border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('질문과 답변')}
                  </div>
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                        msg.role === 'user'
                          ? isLightMode 
                            ? "bg-slate-100 text-slate-800 ml-4 font-medium" 
                            : "bg-slate-800 text-slate-200 ml-4 font-medium"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mr-2"
                      }`}
                    >
                      {msg.role === 'ai' && (
                        <div className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">
                          🛸 MyStair AI
                        </div>
                      )}
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Action Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400">
                  {t('빠른 코칭 질문')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('이 문항의 첫 문장을 어떻게 시작하면 좋을까?')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
                  >
                    💡 {t('도입부 시작 팁')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('지금 쓴 내용에서 STAR 기법 중 부족한 부분이 뭐야?')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
                  >
                    ⭐ {t('STAR 기법 점검')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('내용을 숫자로 구체화할 수 있는 예시 알려줘')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
                  >
                    📊 {t('숫자 표현 팁')}
                  </button>
                </div>
              </div>

              {/* Interactive Ask Box (Notion AI Style) */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    handleAskQuestion();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={e => setUserQuestion(e.target.value)}
                    placeholder={t('코치에게 직접 질문하기 (예: 이 표현 어색해?)')}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border transition-all ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500" 
                        : "bg-slate-800/80 border-slate-700 focus:bg-slate-800 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !userQuestion.trim()}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
                    title={t('질문 전송')}
                  >
                    {isAsking ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                </form>
              </div>

              {/* Ethical AI Notice */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 text-center pt-1">
                <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                <span>{t('대필하지 않고 학생의 주도적 작성을 돕는 실시간 보조 AI입니다.')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Floating Mascot Round Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSpeechBubble(false);
        }}
        className="pointer-events-auto group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        title={isOpen ? t('AI 코치 닫기') : t('외계인 AI 코치 열기')}
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-sm group-hover:bg-emerald-400/50 transition-all"></span>

        {/* Mascot Face Canvas */}
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
          <AlienUFOSvg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
        </div>

        {/* Live Status Badge */}
        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white dark:border-slate-900 flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>AI</span>
        </div>
      </button>

    </div>
  );
}
