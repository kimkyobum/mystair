import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  ArrowUp, 
  Copy, 
  Check, 
  ThumbsUp, 
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Bot
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
  forceOpenTrigger?: { open: boolean; speak: boolean; customMessage?: string; timestamp: number };
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
  diaries: propDiaries,
  forceOpenTrigger
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

  // 음성 재생 (TTS) 및 마이크 음성인식 (STT) 상태
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mystair_cover_letter_voice_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedVoice, setSelectedVoice] = useState<'sunhi' | 'injoon' | 'seohyeon'>('sunhi');
  const [isMicListening, setIsMicListening] = useState<boolean>(false);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
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

  // AI 음성 (TTS) 재생 중단
  const stopAiVoice = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  // AI 음성 발화 (Edge-TTS 서버 API 우선 사용, 실패 시 브라우저 내장 Web Speech synthesis 폴백)
  const speakAiVoice = async (text: string, msgId: string = 'general') => {
    if (typeof window === 'undefined') return;

    // 만약 현재 재생 중인 발화와 동일한 버튼을 누르면 정지(토글)
    if (isSpeaking && speakingMsgId === msgId) {
      stopAiVoice();
      return;
    }

    stopAiVoice();

    const cleanText = (text || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) return;

    setIsSpeaking(true);
    setSpeakingMsgId(msgId);

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${selectedVoice}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        speakWithClientFallback(cleanText, msgId);
      };

      await audio.play();
    } catch {
      speakWithClientFallback(cleanText, msgId);
    }
  };

  // 클라이언트 브라우저 Web Speech 폴백
  const speakWithClientFallback = (text: string, msgId: string = 'general') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = selectedVoice === 'injoon' ? 0.95 : 1.05;

      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KO'));
      if (koVoices.length > 0) {
        if (selectedVoice === 'injoon') {
          const male = koVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('남성'));
          utterance.voice = male || koVoices[0];
        } else {
          const female = koVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('여성'));
          utterance.voice = female || koVoices[0];
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
  };

  // 음성 안내 ON/OFF 토글
  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mystair_cover_letter_voice_enabled', String(next));
      } catch {}
      if (!next) {
        stopAiVoice();
      }
      return next;
    });
  };

  // 마이크 음성인식 (STT) 시작/중지
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('현재 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome 환경을 권장합니다.'));
      return;
    }

    if (isMicListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsMicListening(false);
      return;
    }

    stopAiVoice();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsMicListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuestion(transcript);
        }
      };

      recognition.onerror = () => {
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // 언마운트 시 오디오 및 음성인식 리소스 해제
  useEffect(() => {
    return () => {
      stopAiVoice();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // 외부(상위 컴포넌트)에서 AI 조언 및 음성 발화 트리거 시 작동
  useEffect(() => {
    if (forceOpenTrigger && forceOpenTrigger.timestamp > 0) {
      if (forceOpenTrigger.open) {
        setIsOpenChat(true);
      }
      if (forceOpenTrigger.customMessage) {
        const msgId = `msg-trigger-${forceOpenTrigger.timestamp}`;
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            sender: 'ai',
            text: forceOpenTrigger.customMessage || '',
            time: getCurrentTimeStr()
          }
        ]);
        if (forceOpenTrigger.speak) {
          setTimeout(() => {
            speakAiVoice(forceOpenTrigger.customMessage || '', msgId);
          }, 350);
        }
      } else {
        const targetText = feedbackSpeech || defaultSpeech;
        if (forceOpenTrigger.speak && targetText) {
          setTimeout(() => {
            speakAiVoice(targetText, 'speech-bubble');
          }, 300);
        }
      }
    }
  }, [forceOpenTrigger]);

  // 초기 웰컴 메시지 (노션 AI 스타일)
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = studentName && studentName !== '지원자'
        ? `안녕하세요, ${studentName}님! MyStair AI 코치입니다.\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 무엇이든 질문해 주세요. 음성 듣기 버튼으로 편하게 들으실 수도 있습니다.`
        : `안녕하세요! MyStair AI 코치입니다.\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 무엇이든 편하게 물어보세요.`;

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
          const cleaned = speech.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
          setFeedbackSpeech(cleaned);
          // 음성 자동 안내가 켜져 있으면 실시간으로 음성 발화
          if (isVoiceEnabled && cleaned) {
            speakAiVoice(cleaned, 'speech-bubble');
          }
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

    stopAiVoice();
    if (isMicListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsMicListening(false);
    }

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
        const rawAns = data.answer || data.response || data.feedback?.speech || data.feedback?.summary || data.text || '';
        let cleanedAnswer = (rawAns || t('실천 가능한 문장으로 구체적인 살을 붙여보세요.')).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        const aiMsgId = `ai-${Date.now()}`;
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          text: cleanedAnswer,
          time: getCurrentTimeStr()
        };
        setMessages(prev => [...prev, aiMsg]);

        // 음성 안내가 켜져 있다면 답변을 즉시 음성으로 말하기
        if (isVoiceEnabled) {
          speakAiVoice(cleanedAnswer, aiMsgId);
        }
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
    stopAiVoice();
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
    ? t(`머릿속에 떠오르는 생각을 다듬지 말고 편하게 적어보세요. 실시간으로 읽고 보완할 점을 음성과 텍스트로 바로 짚어드리겠습니다.`)
    : t(`작성하신 내용을 살펴보고 있습니다. 잠시만 기다려주세요.`);
  const speechText = feedbackSpeech || defaultSpeech;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. 노션 AI 스타일 미니멀 대화창 (클릭 시 열림)                              */}
      {/* ========================================================================= */}
      {isOpenChat && (
        <div 
          className={`pointer-events-auto relative mb-3 w-[360px] sm:w-[400px] md:w-[430px] h-[540px] max-h-[82vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-400/25" 
              : "bg-slate-900 text-slate-100 border-slate-800 shadow-black/70"
          }`}
        >
          {/* 노션 AI 스타일 초간결 헤더 및 음성 컨트롤 */}
          <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isLightMode ? "border-slate-100 bg-white" : "border-slate-800 bg-slate-900/90"
          }`}>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-bold flex items-center gap-1 ${isLightMode ? "text-slate-800" : "text-white"}`}>
                <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                MyStair AI 코치
              </span>
              <span className={isLightMode ? "text-slate-400" : "text-slate-500"}>·</span>
              <span className={`text-[11px] font-semibold truncate max-w-[120px] ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                {sectionTitle || '실시간 코칭'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              {/* 음성 안내 자동 재생 토글 */}
              <button
                type="button"
                onClick={toggleVoiceEnabled}
                className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isVoiceEnabled
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-xs"
                    : isLightMode ? "hover:text-slate-700 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                }`}
                title={isVoiceEnabled ? t('AI 음성 자동 안내 켜짐 (클릭하여 끄기)') : t('AI 음성 자동 안내 꺼짐 (클릭하여 켜기)')}
              >
                {isVoiceEnabled ? (
                  <>
                    <Volume2 size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <span>{t('음성 ON')}</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={13} />
                    <span className="hidden sm:inline">{t('음성 OFF')}</span>
                  </>
                )}
              </button>

              {/* 목소리 선택기 (여성 박선희 / 남성 한도윤) */}
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as any)}
                className={`text-[10px] font-medium py-1 px-1 rounded border outline-none bg-transparent cursor-pointer ${
                  isLightMode ? "border-slate-200 text-slate-600" : "border-slate-700 text-slate-300"
                }`}
                title={t('AI 코치 목소리 변경')}
              >
                <option value="sunhi" className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">여성 멘토 (선희)</option>
                <option value="injoon" className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">남성 멘토 (도윤)</option>
                <option value="seohyeon" className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">청년 멘토 (서현)</option>
              </select>

              <button
                type="button"
                onClick={handleResetChat}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                }`}
                title={t('대화 초기화')}
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAiVoice();
                  setIsOpenChat(false);
                }}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                }`}
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
                    <div className={`px-3.5 py-2 rounded-2xl rounded-tr-xs text-[13px] leading-relaxed max-w-[85%] font-medium ${
                      isLightMode 
                        ? "bg-indigo-600 text-white shadow-xs" 
                        : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  /* AI 메시지: 박스 없이 배경 위에 직접 자연스럽게 배치되는 타이포그래피 */
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center justify-between">
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                        <Sparkles size={11} className="text-indigo-500" />
                        <span>MyStair AI · {msg.time}</span>
                      </div>

                      {/* 실시간 음성 읽어주기 버튼 */}
                      <button
                        type="button"
                        onClick={() => speakAiVoice(msg.text, msg.id)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isSpeaking && speakingMsgId === msg.id
                            ? "bg-rose-500 text-white animate-pulse shadow-xs"
                            : isLightMode
                              ? "bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                              : "bg-slate-800 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300"
                        }`}
                        title={isSpeaking && speakingMsgId === msg.id ? t('음성 정지') : t('AI 음성으로 듣기')}
                      >
                        {isSpeaking && speakingMsgId === msg.id ? (
                          <>
                            <Square size={10} className="fill-current" />
                            <span>{t('정지')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} className="text-indigo-500" />
                            <span>{t('듣기')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className={`leading-relaxed whitespace-pre-line font-medium ${
                      isLightMode ? "text-slate-900" : "text-slate-100"
                    }`}>
                      {msg.text}
                    </p>

                    {/* 노션 AI 하단 아이콘 (복사, 좋아요) */}
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                        }`}
                        title={t('복사')}
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                      <button
                        type="button"
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                        }`}
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
                <div className={`text-[11px] font-bold ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  MyStair AI · {t('답변 생성 중...')}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('지금 어때?')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('내 다이어리 기록 중 어떤 소재를 쓰면 좋을까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('다이어리 소재 추천')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('첫 문장 어떻게 시작할까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('첫 문장 팁')}
            </button>
          </div>

          {/* 노션 AI 스타일 하단 인풋 박스 (마이크 음성 입력 지원) */}
          <div className="p-3 pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`rounded-2xl border p-2 flex flex-col gap-1.5 transition-all focus-within:ring-1 focus-within:ring-indigo-500 ${
                isLightMode 
                  ? "bg-slate-50/90 border-slate-200" 
                  : "bg-slate-800/80 border-slate-700"
              }`}
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={isMicListening ? t('🎙️ 마이크로 말씀하세요...') : t('MyStair AI에게 질문하기... (음성 마이크 지원)')}
                className={`w-full px-1.5 py-1 bg-transparent text-[13px] outline-none font-medium ${
                  isLightMode ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-400"
                }`}
              />

              <div className="flex items-center justify-between pt-0.5">
                <span className={`text-[10px] font-bold px-1 ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  {sectionTitle ? `[${sectionTitle}]` : '실시간 코치'}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* 마이크 음성 질문 버튼 */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isMicListening
                        ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40"
                        : (isLightMode ? "text-slate-400 hover:text-indigo-600 hover:bg-slate-200" : "text-slate-400 hover:text-indigo-400 hover:bg-slate-700")
                    }`}
                    title={isMicListening ? t('음성 듣는 중... (클릭하여 중지)') : t('마이크 음성으로 질문하기')}
                  >
                    {isMicListening ? <MicOff size={13} /> : <Mic size={13} />}
                  </button>

                  {/* 전송 버튼 */}
                  <button
                    type="submit"
                    disabled={isAnswering || !inputQuestion.trim()}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inputQuestion.trim() && !isAnswering
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        : (isLightMode ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50" : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50")
                    }`}
                    title={t('전송')}
                  >
                    <ArrowUp size={13} strokeWidth={2.5} />
                  </button>
                </div>
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
          className={`pointer-events-auto group relative mb-3 p-4 sm:p-4.5 rounded-2xl rounded-br-xs shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-[320px] sm:max-w-[370px] cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={12} />
                  MyStair 실시간 AI 코칭
                </span>
                <span className="text-[10px] text-slate-400">
                  {sectionTitle ? `[${sectionTitle}]` : ''}
                </span>
              </div>

              <p className="text-[13px] sm:text-[13.5px] leading-relaxed font-medium whitespace-pre-line tracking-tight">
                {speechText}
              </p>

              {/* 음성으로 듣기 버튼 및 액션 바 */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakAiVoice(speechText, 'speech-bubble');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isSpeaking && speakingMsgId === 'speech-bubble'
                      ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                      : isLightMode
                        ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800"
                  }`}
                  title={isSpeaking && speakingMsgId === 'speech-bubble' ? t('음성 정지') : t('AI 음성으로 조언 듣기')}
                >
                  {isSpeaking && speakingMsgId === 'speech-bubble' ? (
                    <>
                      <Square size={11} className="fill-current" />
                      <span>{t('음성 정지')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} className="text-indigo-500 dark:text-indigo-400" />
                      <span>{t('AI 음성 듣기')}</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {t('클릭하여 질문하기 →')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 우측 하단 외계인 캐릭터 (클릭 시 노션 AI 스타일 대화창 토글)              */}
      {/* ========================================================================= */}
      <div className="relative">
        {/* 음성 말하는 중일 때 외계인 주변 음파 링 이펙트 */}
        {isSpeaking && (
          <span className="absolute -inset-2 rounded-full border-2 border-indigo-400/80 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={() => {
            if (isOpenChat) {
              stopAiVoice();
              setIsOpenChat(false);
            } else {
              setIsOpenChat(true);
            }
          }}
          className={`pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien ${
            isSpeaking ? "scale-110" : ""
          }`}
          title={isOpenChat ? t('대화창 닫기') : t('MyStair AI 대화하기')}
        >
          <AlienUFOSvg className={`w-14 h-14 sm:w-16 sm:h-16 transition-all ${
            isSpeaking 
              ? "drop-shadow-[0_10px_25px_rgba(99,102,241,0.9)] scale-105" 
              : "drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]"
          }`} />
        </button>
      </div>

    </div>
  );
}

