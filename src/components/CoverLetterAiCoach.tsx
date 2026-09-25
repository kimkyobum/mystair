import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  CheckCircle2,
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

  // 기본적으로 닫힌 상태 (페이지 진입 시 화면을 가리지 않음, 누르면 켜짐)
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 새 메시지나 피드백 도착 시 최하단으로 부드럽게 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [chatHistory, feedback, isOpen, isMinimized, isAsking]);

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

  // 사용자가 타이핑을 멈출 때 실시간 자동 분석
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
    }, 2000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentAnswer, sectionTitle, companyName]);

  // 문항 변경 시 이전 질문 초기화
  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    setChatHistory([]);
  }, [sectionTitle]);

  // AI에게 직접 질문하기
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
            text: data.answer || t('실천 가능한 문장으로 살을 붙여보세요.') 
          }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'ai', 
            text: t('질문을 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.') 
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

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* 1. Expanded Real-Time Coach Card */}
      {isOpen && (
        <div 
          className={`pointer-events-auto mb-3 w-[340px] sm:w-[390px] rounded-2xl shadow-2xl border transition-all flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isLightMode 
              ? "bg-white border-slate-200 text-slate-900" 
              : "bg-slate-900 border-slate-700 text-slate-100"
          } ${isMinimized ? "h-auto" : "h-[520px] max-h-[75vh]"}`}
        >
          {/* Card Header (Fixed Top) */}
          <div className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
            isLightMode ? "bg-slate-50 border-slate-200" : "bg-slate-800/80 border-slate-700"
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-emerald-400/40">
                <AlienUFOSvg className="w-6 h-6 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold truncate">
                    {t('MyStair AI 외계인 코치')}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {sectionTitle ? `[${sectionTitle}]` : t('실시간 피드백')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fetchFeedback(true)}
                disabled={isLoadingFeedback || !currentAnswer.trim()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
                title={t('작성 내용 다시 분석')}
              >
                <RefreshCw size={13} className={isLoadingFeedback ? "animate-spin text-emerald-500" : ""} />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? t('펼치기') : t('접기')}
              >
                {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('닫기')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Card Body - Messages & Feedback (Scrollable) */}
          {!isMinimized && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
              
              {/* Real-time Analysis Card (Clean text blocks, no huge banners) */}
              {feedback && (
                <div className={`p-3 rounded-xl border space-y-2.5 ${
                  isLightMode ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700"
                }`}>
                  <div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] mb-1">
                      {t('실시간 진단')}
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-200">
                      {feedback.summary}
                    </p>
                  </div>

                  {feedback.praise && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="font-bold text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">
                        {t('잘하고 있는 점')}
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {feedback.praise}
                      </p>
                    </div>
                  )}

                  {feedback.tips && feedback.tips.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                        {t('개선 포인트')}
                      </div>
                      {feedback.tips.map((tip, i) => (
                        <div key={i} className="text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                          • {tip}
                        </div>
                      ))}
                    </div>
                  )}

                  {feedback.nextStepHint && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold">{t('다음 추천')}:</span> {feedback.nextStepHint}
                    </div>
                  )}
                </div>
              )}

              {/* Chat / Q&A Messages */}
              {chatHistory.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl text-[12px] leading-relaxed ${
                        msg.role === 'user'
                          ? isLightMode 
                            ? "bg-slate-100 text-slate-800 ml-6 font-medium text-right" 
                            : "bg-slate-800 text-slate-200 ml-6 font-medium text-right"
                          : isLightMode
                            ? "bg-emerald-50/70 border border-emerald-200 text-slate-800 mr-4"
                            : "bg-emerald-950/30 border border-emerald-800/60 text-slate-200 mr-4"
                      }`}
                    >
                      {msg.role === 'ai' && (
                        <div className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                          <AlienUFOSvg className="w-3.5 h-3.5" />
                          <span>{t('MyStair AI')}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !feedback && (
                  <div className="p-4 text-center text-slate-400 text-[11.5px] leading-relaxed">
                    {t('글을 작성하시면 실시간으로 분석해 드리며, 하단에서 무엇이든 편하게 질문하실 수 있습니다.')}
                  </div>
                )
              )}

              {/* Status indicator when answering */}
              {isAsking && (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 animate-pulse flex items-center gap-1.5">
                  <RefreshCw size={12} className="animate-spin text-emerald-500" />
                  <span>{t('외계인 코치가 생각을 정리하고 있어요...')}</span>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Fixed Bottom Section: Quick Chips + Chat Input Bar */}
          {!isMinimized && (
            <div className={`p-3 border-t shrink-0 ${
              isLightMode ? "bg-slate-50 border-slate-200" : "bg-slate-800/80 border-slate-700"
            }`}>
              {/* Quick Prompt Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleAskQuestion('나 뭐 써야 할지 모르겠어')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                    isLightMode 
                      ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  {t('소재 추천')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion('지금 쓴 내용 어때?')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                    isLightMode 
                      ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  {t('작성 내용 평가')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion('첫 문장 어떻게 시작할까?')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                    isLightMode 
                      ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  {t('첫 문장 팁')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion('STAR 기법으로 보완할 점 알려줘')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                    isLightMode 
                      ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  {t('STAR 기법')}
                </button>
              </div>

              {/* Chat Input Field (Always visible at the bottom) */}
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
                  placeholder={t('궁금한 점을 질문해보세요 (예: 지금 어때?)')}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border transition-all ${
                    isLightMode 
                      ? "bg-white border-slate-200 focus:border-emerald-500 text-slate-900" 
                      : "bg-slate-900 border-slate-700 focus:border-emerald-500 text-slate-100"
                  }`}
                />
                <button
                  type="submit"
                  disabled={isAsking || !userQuestion.trim()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all cursor-pointer shrink-0 font-medium"
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
          )}
        </div>
      )}

      {/* 2. Floating Alien Mascot Alone */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien"
        title={isOpen ? t('AI 코치 닫기') : t('MyStair AI 외계인 코치 열기')}
      >
        <AlienUFOSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] transition-all group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]" />
      </button>

    </div>
  );
}
