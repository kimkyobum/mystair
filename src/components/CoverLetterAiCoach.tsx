import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  ArrowUp, 
  Copy, 
  Check, 
  ThumbsUp, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { AlienUFOSvg } from './FloatingAliens';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth, UserProfileData, DiaryEntry } from '../context/AuthContext';

export interface CoverLetterAiCoachProps {
  companyName: string;
  sectionTitle: string;
  recommendedChars: number;
  currentAnswer: string;
  userProfile?: UserProfileData | null;
  diaries?: DiaryEntry[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer,
  userProfile: propUserProfile,
  diaries: propDiaries
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();
  const { user, userProfile: authProfile } = useAuth();

  // 대화창 열림 여부
  const [isOpenChat, setIsOpenChat] = useState<boolean>(false);
  // 외부 말풍선 표시 여부
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);

  // 실시간 외계인 조언 텍스트 (이모지 없음)
  const [feedbackSpeech, setFeedbackSpeech] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);

  // 노션 AI 스타일 채팅 메시지 목록
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');

  // 유저 프로필 및 다이어리 통합 (prop -> authContext -> localStorage 순서로 철저히 복구)
  const getEffectiveUserData = () => {
    const uid = user?.uid || 'local-user';
    let profile: any = propUserProfile || authProfile || {};

    if (!profile.name || !profile.major) {
      try {
        const savedMyPage = localStorage.getItem(`mystair_mypage_data_${uid}`);
        if (savedMyPage) {
          const parsed = JSON.parse(savedMyPage);
          profile = { ...profile, ...parsed };
        }
      } catch {}
      try {
        const savedMock = localStorage.getItem('mystair_mock_user');
        if (savedMock) {
          const parsedMock = JSON.parse(savedMock);
          if (!profile.name && parsedMock.displayName) profile.name = parsedMock.displayName;
        }
      } catch {}
    }

    let diariesList: DiaryEntry[] = propDiaries || [];
    if (diariesList.length === 0) {
      try {
        const savedDiaries = localStorage.getItem(`mystair_local_diaries_${uid}`);
        if (savedDiaries) {
          diariesList = JSON.parse(savedDiaries);
        }
      } catch {}
    }

    return { profile, diariesList };
  };

  const { profile: effectiveProfile, diariesList: effectiveDiaries } = getEffectiveUserData();
  const studentName = effectiveProfile?.name || '지원자';

  // 시간 포맷 (오전/오후 H:MM)
  const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${period} ${displayHours}:${minutes}`;
  };

  // 초기 웰컴 메시지 (노션 AI 스타일: "안녕하세요, 김교범님! 무엇을 도와드릴까요?")
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = studentName && studentName !== '지원자'
        ? `안녕하세요, ${studentName}님! 무엇을 도와드릴까요?\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 궁금한 점이나 피드백을 편하게 질문해 주세요.`
        : `안녕하세요! 무엇을 도와드릴까요?\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 무엇이든 편하게 물어보세요.`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: greeting,
          time: getCurrentTimeStr()
        }
      ]);
    }
  }, [sectionTitle, studentName]);

  // 스크롤 최하단 자동 이동
  useEffect(() => {
    if (isOpenChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpenChat, isAnswering]);

  // 실시간 외계인 말풍선 피드백 자동 조회
  const fetchFeedback = async (force: boolean = false) => {
    const trimmed = (currentAnswer || '').trim();
    if (!force && trimmed === lastAnalyzedTextRef.current) return;

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
          actionType: 'realtime_feedback',
          userProfile: effectiveProfile,
          diaries: effectiveDiaries
        })
      });

      if (res.ok) {
        const data = await res.json();
        const speech = data?.feedback?.speech || data?.feedback?.summary || (data?.feedback?.tips && data.feedback.tips[0]) || '';
        if (speech) {
          // 이모지 완벽 정제
          setFeedbackSpeech(speech.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim());
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI coaching:', err);
    } finally {
      setIsLoadingFeedback(false);
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

  // 질문 전송 처리 (마이페이지 및 다이어리 정보 함께 전송)
  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuestion).trim();
    if (!query || isAnswering) return;

    const timeStr = getCurrentTimeStr();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsAnswering(true);

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
          userQuestion: query,
          userProfile: effectiveProfile,
          diaries: effectiveDiaries
        })
      });

      if (res.ok) {
        const data = await res.json();
        let cleanedAnswer = (data.answer || t('실천 가능한 문장으로 구체적인 살을 붙여보세요.')).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: cleanedAnswer,
          time: getCurrentTimeStr()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'ai',
            text: t('일시적으로 응답을 생성하지 못했습니다. 잠시 후 다시 질문해주세요.'),
            time: getCurrentTimeStr()
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: t('네트워크 연결을 확인해주세요.'),
          time: getCurrentTimeStr()
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  // 대화 초기화
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `대화가 초기화되었습니다. [${sectionTitle || '자기소개서'}] 작성 중 고민되는 점을 편하게 질문해 주세요.`,
        time: getCurrentTimeStr()
      }
    ]);
  };

  // 복사 기능
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // 외계인 말풍선 텍스트 (이모지 없음)
  const defaultSpeech = currentAnswer.trim().length === 0
    ? t(`머릿속에 떠오르는 생각을 다듬지 말고 편하게 적어보세요. 실시간으로 읽고 보완할 점을 바로 짚어드리겠습니다.`)
    : t(`작성하신 내용을 살펴보고 있습니다. 잠시만 기다려주세요.`);
  const speechText = feedbackSpeech || defaultSpeech;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. 노션 AI 스타일 미니멀 대화창 (클릭 시 열림)                              */}
      {/* ========================================================================= */}
      {isOpenChat && (
        <div 
          className={`pointer-events-auto relative mb-3 w-[350px] sm:w-[380px] md:w-[410px] h-[520px] max-h-[82vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-400/25" 
              : "bg-slate-900 text-slate-100 border-slate-800 shadow-black/70"
          }`}
        >
          {/* 노션 AI 스타일 초간결 헤더 */}
          <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isLightMode ? "border-slate-100 bg-white" : "border-slate-800 bg-slate-900"
          }`}>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">MyStair AI</span>
              <span>·</span>
              <span className="text-[11px] truncate max-w-[130px]">{sectionTitle || '실시간 코칭'}</span>
            </div>

            <div className="flex items-center gap-0.5 text-slate-400">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('대화 초기화')}
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpenChat(false)}
                className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('닫기')}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* 노션 AI 스타일 메시지 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-[13.5px]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                {msg.sender === 'user' ? (
                  /* 사용자 메시지: 우측 알약 버블 */
                  <div className="flex justify-end">
                    <div className={`px-3.5 py-2 rounded-2xl rounded-tr-xs text-[13px] leading-relaxed max-w-[85%] ${
                      isLightMode 
                        ? "bg-slate-100 text-slate-800" 
                        : "bg-slate-800 text-slate-100"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  /* AI 메시지: 박스 없이 배경 위에 직접 자연스럽게 배치되는 타이포그래피 */
                  <div className="space-y-1.5 pr-2">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      MyStair AI · {msg.time}
                    </div>
                    <p className="leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-normal">
                      {msg.text}
                    </p>

                    {/* 노션 AI 하단 아이콘 (복사, 좋아요) */}
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400 dark:text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={t('복사')}
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={t('좋아요')}
                      >
                        <ThumbsUp size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 생각 중 인디케이터 */}
            {isAnswering && (
              <div className="space-y-1 pr-2">
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  MyStair AI · {t('답변 생성 중...')}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 질문 추천 칩 (다이어리 및 소재 추천) */}
          <div className="px-3 py-1 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage('지금 쓴 내용 어때?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('지금 어때?')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('내 다이어리 기록 중 어떤 소재를 쓰면 좋을까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('다이어리 소재 추천')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('첫 문장 어떻게 시작할까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('첫 문장 팁')}
            </button>
          </div>

          {/* 노션 AI 스타일 하단 인풋 박스 */}
          <div className="p-3 pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`rounded-2xl border p-2 flex flex-col gap-1.5 transition-all focus-within:ring-1 focus-within:ring-slate-400 ${
                isLightMode 
                  ? "bg-slate-50/70 border-slate-200/90" 
                  : "bg-slate-800/60 border-slate-700/80"
              }`}
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={t('MyStair AI에게 질문하기...')}
                className="w-full px-1.5 py-1 bg-transparent text-[13px] outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                  {sectionTitle ? `[${sectionTitle}]` : '실시간 코치'}
                </span>

                <button
                  type="submit"
                  disabled={isAnswering || !inputQuestion.trim()}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputQuestion.trim() && !isAnswering
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                  title={t('전송')}
                >
                  <ArrowUp size={13} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 외계인 실시간 피드백 말풍선 (채팅창이 닫혀 있을 때 표시)                   */}
      {/* ========================================================================= */}
      {!isOpenChat && showSpeechBubble && (
        <div 
          onClick={() => setIsOpenChat(true)}
          className={`pointer-events-auto group relative mb-3 p-4 sm:p-4.5 rounded-2xl rounded-br-xs shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-[320px] sm:max-w-[360px] cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-300/40 hover:border-slate-400/60" 
              : "bg-slate-900 text-slate-100 border-slate-700/90 shadow-black/60 hover:border-slate-500/60"
          }`}
          title={t('클릭하여 대화창 열기')}
        >
          {/* 말풍선 꼬리 */}
          <div 
            className={`absolute -bottom-1.5 right-6 w-3.5 h-3.5 transform rotate-45 border-r border-b ${
              isLightMode 
                ? "bg-white border-slate-200/90" 
                : "bg-slate-900 border-slate-700/90"
            }`} 
          />

          {isLoadingFeedback ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-0.5">
              <RefreshCw size={12} className="animate-spin text-slate-400 shrink-0" />
              <span>{t('작성 내용을 읽고 있습니다...')}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[13px] sm:text-[13.5px] leading-relaxed font-medium whitespace-pre-line tracking-tight">
                {speechText}
              </p>
              <div className="flex items-center justify-end pt-1">
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {t('클릭하여 질문하기')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 우측 하단 외계인 캐릭터 (클릭 시 노션 AI 스타일 대화창 토글)              */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => {
          if (isOpenChat) {
            setIsOpenChat(false);
          } else {
            setIsOpenChat(true);
          }
        }}
        className="pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien"
        title={isOpenChat ? t('대화창 닫기') : t('MyStair AI 대화하기')}
      >
        <AlienUFOSvg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] transition-all group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]" />
      </button>

    </div>
  );
}
