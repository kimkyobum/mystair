import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Play, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Award, 
  ChevronRight, 
  HelpCircle, 
  Layers, 
  MessageSquareQuote,
  Clock,
  Briefcase
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth } from '../context/AuthContext';

// 마이스터/특성화고 전공 맞춤형 모의면접 질문 은행
interface InterviewQuestion {
  id: number;
  question: string;
  category: '기본역량' | '전공직무' | '협업태도' | '돌발위기';
  hint: string;
}

const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "자기소개와 함께 우리 회사에 지원하게 된 동기를 1분 내외로 말씀해 주세요.",
    category: "기본역량",
    hint: "마이스터고에서 배운 실무 강점과 회사의 비전에 매료된 이유를 명확하게 연결하세요."
  },
  {
    id: 2,
    question: "학창 시절 전공 실습이나 프로젝트를 진행하면서 겪었던 가장 큰 기술적 어려움과, 이를 어떻게 극복했는지 구체적으로 설명해 주세요.",
    category: "전공직무",
    hint: "단순히 힘들었던 점이 아닌, 원인을 분석하고 해결책을 찾아낸 '과정'과 '배운 점'에 초점을 맞추세요."
  },
  {
    id: 3,
    question: "팀 프로젝트나 동아리 활동 중 조원과 의견 충돌이 발생했을 때, 어떻게 조율하여 성공적으로 마무리하셨나요?",
    category: "협업태도",
    hint: "상대방의 입장을 경청하고 데이터나 객관적인 기준을 바탕으로 상호 절충안을 도출한 경험을 제시하세요."
  },
  {
    id: 4,
    question: "입사 후 생산 라인이나 현장에서 안전 수칙과 작업 납기일 준수가 상충하는 돌발 상황이 발생한다면 어떻게 행동하시겠습니까?",
    category: "돌발위기",
    hint: "안전은 절대 타협할 수 없는 기본 원칙임을 명시하고, 신속한 상황 보고 및 협의 절차를 제시하세요."
  },
  {
    id: 5,
    question: "마지막으로 우리 회사에서 5년 후 어떤 엔지니어 또는 전문가로 성장하고 싶은지 포부를 말씀해 주세요.",
    category: "기본역량",
    hint: "구체적인 직무 목표(공정 최적화, 자격 취득, 후배 지도 등)를 바탕으로 지속 가능한 성장 의지를 보여주세요."
  }
];

export default function Interview() {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();
  const { user, userProfile } = useAuth();

  // 웹캠 상태 및 스트림
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  // 마이크 음성 인식(STT)
  const [micActive, setMicActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 면접 진행 단계
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: 질문 목록, 1..5: 해당 질문
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [feedbacks, setFeedbacks] = useState<Record<number, { score: number; comment: string; goodPoints: string[]; improvePoints: string[] }>>({});

  // OGQ 마켓 스티커 리액션
  const [stickers, setStickers] = useState<{ id: string; url: string; title: string }[]>([]);
  const [currentSticker, setCurrentSticker] = useState<string | null>(null);
  const [ogqNotice, setOgqNotice] = useState<string>('');

  // 음성 TTS 안내
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState<boolean>(true);

  // 1. OGQ 마켓 API에서 격려/응원 스티커 불러오기
  useEffect(() => {
    fetch('/api/ogq/stickers?query=응원&pageSize=8')
      .then(res => res.json())
      .then(data => {
        if (data && data.elements && data.elements.length > 0) {
          const list = data.elements.map((el: any) => ({
            id: el.assetId,
            url: el.thumbnailUrl || el.imageUrl,
            title: el.title || 'OGQ 프렌즈'
          }));
          setStickers(list);
        }
      })
      .catch(err => console.warn('OGQ sticker load error', err));
  }, []);

  // 2. 웹캠 켜기 함수
  const startCamera = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(t('카메라나 마이크 권한을 승인해주세요. 브라우저 주소창 왼쪽의 자물쇠를 눌러 허용할 수 있습니다.'));
      setCameraActive(false);
    }
  };

  // 3. 웹캠 끄기 함수
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // 컴포넌트 언마운트 시 카메라 해제
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // 4. 면접관 TTS 음성 재생
  const speakQuestion = (text: string) => {
    if (!voiceGuideEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95; // 단정하고 신뢰감 있는 속도
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS not supported', e);
    }
  };

  // 5. 음성 인식 STT 토글
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('이 브라우저는 음성 인식을 지원하지 않습니다. 텍스트로 직접 입력하실 수 있습니다.'));
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCurrentAnswer(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('STT error', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.warn('SpeechRecognition start failed', err);
      setIsRecording(false);
    }
  };

  // 6. 질문 선택 및 이동
  const handleSelectQuestion = (idx: number) => {
    setCurrentStep(idx + 1);
    setCurrentAnswer(userAnswers[idx + 1] || '');
    speakQuestion(DEFAULT_QUESTIONS[idx].question);
  };

  // 7. AI 답변 평가 제출
  const handleSubmitAnswer = async () => {
    const q = DEFAULT_QUESTIONS[currentStep - 1];
    if (!currentAnswer.trim()) {
      alert(t('답변을 먼저 음성이나 텍스트로 입력해 주세요!'));
      return;
    }

    setIsEvaluating(true);
    setUserAnswers(prev => ({ ...prev, [currentStep]: currentAnswer }));

    try {
      const res = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          answer: currentAnswer,
          category: q.category,
          targetCompany: (userProfile?.targetCompanies && userProfile.targetCompanies.length > 0) ? userProfile.targetCompanies[0] : '마이스터/특성화고 추천 기업',
          targetRole: userProfile?.major || '엔지니어링/기술'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbacks(prev => ({
          ...prev,
          [currentStep]: {
            score: data.score || 88,
            comment: data.comment || '훌륭하고 당당한 답변이었습니다.',
            goodPoints: data.goodPoints || ['현장 경험과 전공 지식을 구체적으로 제시함'],
            improvePoints: data.improvePoints || ['수치나 결과 중심의 근거를 덧붙이면 더욱 돋보입니다']
          }
        }));

        // 무작위 OGQ 격려 스티커 표시
        if (stickers.length > 0) {
          const randSticker = stickers[Math.floor(Math.random() * stickers.length)];
          setCurrentSticker(randSticker.url);
          setOgqNotice(t('OGQ 프렌즈 캐릭터가 면접관의 열정을 응원합니다!'));
        }
      }
    } catch (err) {
      console.error('Interview evaluation error', err);
      // 로컬 피드백 기본값
      setFeedbacks(prev => ({
        ...prev,
        [currentStep]: {
          score: 85,
          comment: t('자신의 생각과 경험을 또박또박 진솔하게 전달하셨습니다.'),
          goodPoints: [t('자신감 있는 어조와 솔직한 태도'), t('전공 및 실습과의 유기적 연결')],
          improvePoints: [t('핵심 두괄식 답변(결론을 먼저 말하기)을 조금 더 강조해 보세요.')]
        }
      }));
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQ = currentStep > 0 ? DEFAULT_QUESTIONS[currentStep - 1] : null;
  const currentFeedback = currentStep > 0 ? feedbacks[currentStep] : null;

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/80 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-400'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-1 sm:ml-2 shrink-0 flex items-center gap-1.5">
            <Sparkles size={12} />
            {t('AI 모의면접')}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setVoiceGuideEnabled(!voiceGuideEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              voiceGuideEnabled
                ? (isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300')
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400')
            }`}
            title={voiceGuideEnabled ? t('면접관 음성 켜짐') : t('면접관 음성 꺼짐')}
          >
            {voiceGuideEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{voiceGuideEnabled ? t('AI 음성안내') : t('음성 음소거')}</span>
          </button>

          <Link
            to="/cover-letter"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isLightMode ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Briefcase size={14} className="text-emerald-500" />
            <span>{t('자기소개서 바로가기')}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* Banner Notice */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isLightMode ? 'bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 border-indigo-100' : 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border-indigo-900/40'
        }`}>
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <Camera className="text-indigo-500" size={24} />
              <span>{t('실시간 AI 카메라 모의면접실')}</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('카메라로 나의 시선과 표정을 점검하며, 실제 채용 면접관의 빈출 핵심 질문에 당당하게 답변해 보세요.')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
              >
                <Camera size={16} />
                <span>{t('카메라 켜기')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition-all cursor-pointer"
              >
                <CameraOff size={16} />
                <span>{t('카메라 끄기')}</span>
              </button>
            )}
          </div>
        </div>

        {cameraError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-medium">
            ⚠️ {cameraError}
          </div>
        )}

        {/* 2-Column Split: Left Webcam & Real-time Mirror / Right Questions & AI Evaluation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Webcam Screen & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`relative rounded-2xl overflow-hidden border shadow-lg aspect-video sm:aspect-[4/3] flex items-center justify-center ${
              isLightMode ? 'bg-slate-900 border-slate-200' : 'bg-black border-slate-800'
            }`}>
              {/* Actual Video Element */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive ? 'hidden' : 'block'}`}
              />

              {/* Inactive Placeholder */}
              {!cameraActive && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mb-3">
                    <Camera size={28} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-200 mb-1">{t('카메라가 꺼져 있습니다')}</p>
                  <p className="text-xs text-slate-400 max-w-xs">{t('상단의 [카메라 켜기] 버튼을 누르면 나의 얼굴과 표정을 실시간으로 보며 면접을 진행할 수 있습니다.')}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  >
                    {t('카메라 허용 및 시작')}
                  </button>
                </div>
              )}

              {/* Status Overlay when Camera is On */}
              {cameraActive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{t('실시간 거울 ON')}</span>
                </div>
              )}

              {/* OGQ Sticker Cheer Reaction Popup */}
              {currentSticker && (
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-indigo-400 shadow-xl flex items-center gap-2 animate-bounce">
                  <img src={currentSticker} alt="OGQ Cheer" className="w-12 h-12 object-contain" />
                  <div className="pr-1 text-left">
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 block">{t('OGQ 응원!')}</span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t('잘하고 있어요!')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mirror Guide Tips */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isLightMode ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span className="font-bold text-indigo-500 block mb-1">💡 {t('면접 시선 및 표정 체크포인트')}:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('화면보다는 노트북/스마트폰 상단 카메라 렌즈를 응시하세요.')}</li>
                <li>{t('어깨를 펴고 턱을 가볍게 당겨 당당한 자세를 유지하세요.')}</li>
                <li>{t('말을 시작할 때 미소를 머금으면 긍정적인 인상을 줍니다.')}</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive AI Interviewer & Question Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Question Tabs Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {DEFAULT_QUESTIONS.map((q, idx) => {
                const isActive = currentStep === idx + 1;
                const isAnswered = !!userAnswers[idx + 1];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : isAnswered
                          ? (isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/40 border-emerald-800 text-emerald-300')
                          : (isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800')
                    }`}
                  >
                    {isAnswered ? <CheckCircle2 size={13} className="text-emerald-400" /> : <span>Q{idx + 1}</span>}
                    <span>{q.category}</span>
                  </button>
                );
              })}
            </div>

            {/* Current Question Box */}
            {currentQ ? (
              <div className={`p-5 rounded-2xl border transition-all ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                {/* Badge & Audio trigger */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {t('면접 질문')} {currentStep} / {DEFAULT_QUESTIONS.length} • {currentQ.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => speakQuestion(currentQ.question)}
                    className={`text-xs flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                      isLightMode ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    <Volume2 size={15} />
                    <span>{t('질문 다시 듣기')}</span>
                  </button>
                </div>

                <h2 className="text-base sm:text-lg font-bold leading-snug mb-3">
                  "{currentQ.question}"
                </h2>

                <div className={`p-3 rounded-xl text-xs mb-4 border ${
                  isLightMode ? 'bg-amber-50/70 border-amber-200/80 text-amber-900' : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}>
                  <span className="font-bold">🎯 {t('답변 핵심 가이드')}:</span> {currentQ.hint}
                </div>

                {/* Answer Input Area with STT and text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{t('나의 면접 답변')}:</span>
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : (isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')
                      }`}
                    >
                      {isRecording ? <Mic size={14} /> : <MicOff size={14} />}
                      <span>{isRecording ? t('음성 듣는 중... (클릭시 정지)') : t('마이크로 말하기')}</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    placeholder={t('마이크 버튼을 눌러 말씀하시거나, 이곳에 직접 답변 내용을 정리해 작성해 보세요.')}
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none resize-none transition-colors ${
                      isLightMode 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500' 
                        : 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Evaluation Action Button */}
                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || !currentAnswer.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles size={16} className="animate-spin" />
                        <span>{t('AI 면접관 평가 분석 중...')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{t('AI 면접관에게 답변 제출 및 피드백 받기')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Feedback Report Card */}
                {currentFeedback && (
                  <div className={`mt-5 p-4 rounded-xl border animate-in fade-in duration-300 ${
                    isLightMode ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/30 border-indigo-900/40'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Award size={18} />
                        {t('AI 면접관 종합 피드백')}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                        {currentFeedback.score}점 / 100점
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium leading-relaxed mb-3">
                      {currentFeedback.comment}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-lg border ${
                        isLightMode ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-slate-900 border-emerald-900 text-emerald-300'
                      }`}>
                        <span className="font-bold block mb-1">👍 {t('잘한 점')}:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {currentFeedback.goodPoints.map((gp, i) => (
                            <li key={i}>{gp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`p-3 rounded-lg border ${
                        isLightMode ? 'bg-white border-amber-200 text-amber-800' : 'bg-slate-900 border-amber-900 text-amber-300'
                      }`}>
                        <span className="font-bold block mb-1">💡 {t('보완하면 더 좋은 점')}:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {currentFeedback.improvePoints.map((ip, i) => (
                            <li key={i}>{ip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-8 rounded-2xl border text-center ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <HelpCircle size={40} className="mx-auto text-indigo-400 mb-3" />
                <h3 className="text-base font-bold mb-1">{t('면접 질문을 선택해 주세요')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{t('상단의 5대 마이스터 면접 질문 중 연습하고자 하는 문항을 클릭하면 면접관의 질문이 시작됩니다.')}</p>
                <button
                  type="button"
                  onClick={() => handleSelectQuestion(0)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  {t('1번 질문부터 시작하기')}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
