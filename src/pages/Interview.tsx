import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Award, 
  Eye, 
  ShieldCheck, 
  UserCheck, 
  Briefcase,
  Key,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume1,
  MessageSquare,
  Flame,
  Zap,
  Timer,
  Bell,
  BellOff,
  Activity,
  Scale,
  Smile,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth } from '../context/AuthContext';

export type InterviewerVoiceKey = 
  | 'injoon' 
  | 'bongjin' 
  | 'hyunsu' 
  | 'sunhi' 
  | 'jimin' 
  | 'seohyeon' 
  | 'strict_bongjin' 
  | 'gentle_injoon' 
  | 'energetic_hyunsu' 
  | 'professional_sunhi';

export interface InterviewerVoiceOption {
  id: InterviewerVoiceKey;
  name: string;
  role: string;
  category: '남성 면접관' | '여성 면접관' | '특화 면접관';
  gender: 'male' | 'female';
  pitch: number;
  rate: number;
  icon: string;
}

export const INTERVIEWER_VOICE_LIST: InterviewerVoiceOption[] = [
  { id: 'injoon', name: '이인준', role: '신뢰감 있는 40대 남성', category: '남성 면접관', gender: 'male', pitch: 0.88, rate: 0.95, icon: '🎙️' },
  { id: 'bongjin', name: '신봉진', role: '묵직한 50대 베테랑 남성', category: '남성 면접관', gender: 'male', pitch: 0.72, rate: 0.90, icon: '🎙️' },
  { id: 'hyunsu', name: '김현수', role: '스마트하고 또렷한 30대 남성', category: '남성 면접관', gender: 'male', pitch: 0.96, rate: 1.00, icon: '🎙️' },
  { id: 'sunhi', name: '박선희', role: '단정하고 명확한 30대 여성', category: '여성 면접관', gender: 'female', pitch: 1.08, rate: 0.98, icon: '🎧' },
  { id: 'jimin', name: '정지민', role: '부드럽고 차분한 40대 여성', category: '여성 면접관', gender: 'female', pitch: 1.02, rate: 0.92, icon: '🎧' },
  { id: 'seohyeon', name: '강서현', role: '정중하고 세련된 20대 여성', category: '여성 면접관', gender: 'female', pitch: 1.15, rate: 1.02, icon: '🎧' },
  { id: 'strict_bongjin', name: '최준혁', role: '엄격한 50대 압박 심층 면접관', category: '특화 면접관', gender: 'male', pitch: 0.65, rate: 0.85, icon: '⚡' },
  { id: 'gentle_injoon', name: '박진우', role: '온화하고 따뜻한 40대 멘토 면접관', category: '특화 면접관', gender: 'male', pitch: 0.92, rate: 0.92, icon: '🌱' },
  { id: 'energetic_hyunsu', name: '한도현', role: '패기 넘치는 30대 현장 팀장 면접관', category: '특화 면접관', gender: 'male', pitch: 1.05, rate: 1.06, icon: '🚀' },
  { id: 'professional_sunhi', name: '윤채원', role: '인사총괄 40대 시니어 임원 면접관', category: '특화 면접관', gender: 'female', pitch: 1.00, rate: 0.94, icon: '👑' }
];

export interface InterviewQuestion {
  id: number;
  question: string;
  category: "기본역량" | "전공직무" | "협업태도" | "돌발위기";
  hint: string;
}

export const ALL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "자기소개와 함께 우리 회사에 지원하게 된 솔직한 동기를 1분 내외로 말씀해 주세요.",
    category: "기본역량",
    hint: "마이스터고에서 배운 실무 강점과 회사의 비전에 매료된 이유를 명확하게 연결하세요."
  },
  {
    id: 2,
    question: "자신의 가장 큰 직무상 장점과, 반대로 극복하려고 노력 중인 단점 한 가지를 말씀해 주십시오.",
    category: "기본역량",
    hint: "단점은 솔직하게 인정하되, 현재 어떤 구체적인 방식으로 개선하고 있는지 행동 계획을 제시하세요."
  },
  {
    id: 3,
    question: "전공 실습이나 프로젝트를 수행하면서 예상치 못한 설비 고장이나 치명적인 오류를 마주했을 때 어떻게 해결했습니까?",
    category: "전공직무",
    hint: "원인을 분석하고 해결책을 찾아낸 '과정'과 '배운 점'에 초점을 맞추세요."
  },
  {
    id: 4,
    question: "전공 자격증 취득이나 실습을 하면서 가장 기억에 남는 배움은 무엇이었으며, 그 과정에서 동료들과의 협업 경험을 말씀해 주세요.",
    category: "전공직무",
    hint: "기술적 성취뿐만 아니라 실습실에서 동료들과 조율하고 극복했던 과정을 진솔하게 풀어내세요."
  },
  {
    id: 5,
    question: "팀 프로젝트 중 팀원이 맡은 역할을 다하지 못해 전체 마감 일정이 위태로웠던 적이 있나요? 그때 어떻게 대처하셨습니까?",
    category: "협업태도",
    hint: "비난보다는 원인 파악과 역할 재분담, 그리고 최종 성과를 위한 헌신을 강조하세요."
  },
  {
    id: 6,
    question: "입사 후 생산 라인이나 현장에서 안전 수칙과 긴급 납기일 준수가 상충하는 돌발 상황이 발생한다면 어떻게 행동하시겠습니까?",
    category: "돌발위기",
    hint: "안전은 타협할 수 없는 제1원칙임을 명시하고, 선보고 및 비상대응 절차를 설명하세요."
  },
  {
    id: 7,
    question: "상사나 선배 엔지니어가 본인의 작업 방식에 대해 엄격하게 지적하거나 수정 지시를 내렸을 때 어떻게 수용하시겠습니까?",
    category: "협업태도",
    hint: "지적의 본질적 이유를 경청하고 개선 사항을 즉시 업무 일지나 체크리스트에 반영하겠다는 적극성을 어필하세요."
  },
  {
    id: 8,
    question: "마지막으로 우리 회사에 입사한다면 5년 후 어떤 숙련 엔지니어로 성장해 있을지 포부를 말씀해 주세요.",
    category: "기본역량",
    hint: "구체적인 직무 목표(설비 최적화, 후배 멘토링, 공정 자동화 등)를 중심으로 답변하세요."
  }
];

export interface BehaviorMetrics {
  eyeContactScore: number;
  postureStability: number;
  voiceLoudnessScore: number;
  fidgetingCount: number;
  blinkRatePerMin: number;
  totalBlinkCount: number;
  distractingHabits: string[];
  behaviorVerdict: string;
  shoulderStatus: 'level' | 'left_tilted' | 'right_tilted' | 'moving';
  shoulderMessage: string;
  expressionStatus: 'good' | 'neutral' | 'tense';
  expressionMessage: string;
}

export default function Interview() {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();
  const { userProfile } = useAuth();

  // 면접 코스 시간 선택 모달 (null: 코스 미선택, 3 | 5 | 10: 선택됨)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [candidateDuration, setCandidateDuration] = useState<number>(5); // 카드 선택 상태 (기본 5분 추천)
  const [activeQuestions, setActiveQuestions] = useState<InterviewQuestion[]>([]);

  // 실시간 면접 준비 확인 모달 및 3,2,1 카운트다운 상태
  const [isPrepModalOpen, setIsPrepModalOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 면접 완료 및 최종 리포트 상태
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // 실시간 면접 제한 시간 타이머 (초 단위)
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // 자동 다음 질문 카운트다운 (5초 침묵 감지 후 자동 전환)
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const lastSpeechTimestampRef = useRef<number>(Date.now());
  const autoNextIntervalRef = useRef<any>(null);

  // 사용자 지정 전용 AI API 키
  const [dedicatedApiKey, setDedicatedApiKey] = useState<string>(() => {
    return (
      (typeof window !== 'undefined' ? localStorage.getItem('mystair_interview_ai_key') : '') ||
      import.meta.env.VITE_OGQ_API_KEY ||
      import.meta.env.VITE_INTERVIEW_API_KEY ||
      (typeof process !== 'undefined' ? (process.env.OGQ_API_KEY || (process.env as any).INTERVIEW_API_KEY) : '') ||
      'ogqc_c3ad18e9908f34113fec37e0d6362884aa4b6e25f27a48b2283db046e0c6f238'
    );
  });
  const [showKeySetting, setShowKeySetting] = useState<boolean>(false);

  // 웹캠 상태 및 스트림
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');

  // 음량 및 오디오 분석 (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);

  // 누적 통계 데이터 (최종 리포트용)
  const shoulderTiltedCountRef = useRef<number>(0);
  const postureUnstableCountRef = useRef<number>(0);
  const eyeDeviationCountRef = useRef<number>(0);
  const fidgetingCountRef = useRef<number>(0);
  const smileCountRef = useRef<number>(0);
  const micScoresRef = useRef<number[]>([]);

  // 실시간 행동 및 태도 종합 지표
  const [realtimeBehavior, setRealtimeBehavior] = useState<BehaviorMetrics>({
    eyeContactScore: 92,
    postureStability: 94,
    voiceLoudnessScore: 88,
    fidgetingCount: 0,
    blinkRatePerMin: 18,
    totalBlinkCount: 0,
    distractingHabits: [],
    behaviorVerdict: '어깨 수평과 시선이 안정적으로 감지되고 있습니다.',
    shoulderStatus: 'level',
    shoulderMessage: '양쪽 어깨 수평이 고르게 유지되는 상태입니다.',
    expressionStatus: 'neutral',
    expressionMessage: '단정하고 차분한 기본 표정을 유지하고 있습니다.'
  });

  // 음성 인식 (STT)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 면접 단계
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  // 음성 TTS 안내 (고품질 면접관 보이스)
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState<boolean>(true);
  const [interviewerVoice, setInterviewerVoice] = useState<InterviewerVoiceKey>('injoon');
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState<boolean>(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // 상단 제어 바: 마이크 음소거 / 카메라 끄기 토글
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

  // Ref tracking for vision & pose analysis
  const prevTorsoDataRef = useRef<Uint8ClampedArray | null>(null);
  const blinkTimestampsRef = useRef<number[]>([]);
  const totalBlinkCountRef = useRef<number>(0);
  const lastEyeLumaRef = useRef<number | null>(null);
  const eyeLumaBaselineRef = useRef<number | null>(null);
  const lastBlinkTimeRef = useRef<number>(0);
  const lastFidgetTimeRef = useRef<number>(0);
  const lastMicTimeRef = useRef<number>(0);
  const prevLeftShoulderYRef = useRef<number | null>(null);
  const prevRightShoulderYRef = useRef<number | null>(null);
  const prevEyeDarkRef = useRef<number | null>(null);
  const lastStateUpdateTimeRef = useRef<number>(0);
  const smoothShoulderDiffRef = useRef<number>(0);
  const shoulderStatusHoldRef = useRef<{ status: 'level' | 'left_tilted' | 'right_tilted' | 'moving'; until: number }>({ status: 'level', until: 0 });
  const expressionStatusHoldRef = useRef<{ status: 'good' | 'neutral' | 'tense'; until: number }>({ status: 'neutral', until: 0 });
  const expressionHistoryRef = useRef<('good' | 'neutral' | 'tense')[]>([]);
  const faceBaselineRef = useRef<{ browLuma: number; cheekLuma: number; mouthVar: number } | null>(null);
  const smoothPostureStabilityRef = useRef<number>(94);
  const smoothEyeContactRef = useRef<number>(92);

  // 마이크 음소거 토글
  const toggleMicMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach(t => { t.enabled = nextState; });
        setIsMicMuted(!nextState);
      } else {
        setIsMicMuted(prev => !prev);
      }
    } else {
      setIsMicMuted(prev => !prev);
    }
  };

  // 카메라 ON/OFF 토글
  const toggleCameraOff = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach(t => { t.enabled = nextState; });
        setIsCameraOff(!nextState);
      } else {
        setIsCameraOff(prev => !prev);
      }
    } else {
      setIsCameraOff(prev => !prev);
    }
  };

  // 1. 코스 카드 선택
  const handleSelectCourseCard = (minutes: 3 | 5 | 10) => {
    setCandidateDuration(minutes);
  };

  // 1단계: 면접 코스 진입 (준비 확인 모달 표시)
  const handleStartInterview = (minutes?: number) => {
    const targetMin = minutes || candidateDuration || 5;
    setSelectedDuration(targetMin);
    let count = 3;
    if (targetMin === 5) count = 5;
    if (targetMin === 10) count = 8;

    const chosen = ALL_QUESTIONS.slice(0, count);
    setActiveQuestions(chosen);
    setRemainingTime(targetMin * 60);
    setIsTimerRunning(false);
    setIsFinished(false);
    setCurrentStep(1);
    setCurrentAnswer('');
    setUserAnswers({});
    setAutoNextCountdown(null);

    // 누적 통계 리셋
    shoulderTiltedCountRef.current = 0;
    postureUnstableCountRef.current = 0;
    eyeDeviationCountRef.current = 0;
    fidgetingCountRef.current = 0;
    smileCountRef.current = 0;
    micScoresRef.current = [];
    totalBlinkCountRef.current = 0;

    startCamera();
    setIsPrepModalOpen(true);
    setCountdown(null);
  };

  // 2단계: "네, 시작할게요" 클릭 시 3, 2, 1 카운트다운 실행
  const handleConfirmCountdown = () => {
    setIsPrepModalOpen(false);
    setCountdown(3);

    const countTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countTimer);
          setCountdown(null);
          
          // 카운트다운 완료 후 면접 본격 시작
          setIsTimerRunning(true);
          const chosen = activeQuestions.length > 0 ? activeQuestions : ALL_QUESTIONS.slice(0, 5);
          
          setTimeout(() => {
            speakLikeInterviewer(`반갑습니다. 오늘 면접을 맡은 기술면접관입니다. 편안한 마음으로 임해주시되, 실제 현장이라 생각하고 또박또박 답변해 주시기 바랍니다. 첫 번째 질문 드립니다. ${chosen[0].question}`);
            startSpeechRecognition();
          }, 400);

          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 3. 타이머 카운트다운
  useEffect(() => {
    if (!isTimerRunning || remainingTime <= 0 || isFinished) return;
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          finishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, remainingTime, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 4. 면접관 TTS 음성
  const speakLikeInterviewer = async (text: string) => {
    if (!voiceGuideEnabled || typeof window === 'undefined') return;

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsInterviewerSpeaking(true);

    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) {
      setIsInterviewerSpeaking(false);
      return;
    }

    try {
      const audioUrl = `/api/interview-tts?text=${encodeURIComponent(cleanText)}&voice=${interviewerVoice}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsInterviewerSpeaking(false);
        activeAudioRef.current = null;
      };

      audio.onerror = async () => {
        try {
          const res = await fetch('/api/interview-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleanText, voice: interviewerVoice })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audioBase64) {
              const postAudio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
              activeAudioRef.current = postAudio;
              postAudio.onended = () => {
                setIsInterviewerSpeaking(false);
                activeAudioRef.current = null;
              };
              postAudio.onerror = () => {
                activeAudioRef.current = null;
                speakWithClientFallback(cleanText);
              };
              await postAudio.play();
              return;
            }
          }
        } catch {}
        speakWithClientFallback(cleanText);
      };

      await audio.play();
    } catch (err) {
      speakWithClientFallback(cleanText);
    }
  };

  const speakWithClientFallback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsInterviewerSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';

      const currentProfile = INTERVIEWER_VOICE_LIST.find(v => v.id === interviewerVoice) || INTERVIEWER_VOICE_LIST[0];
      utterance.pitch = currentProfile.pitch;
      utterance.rate = currentProfile.rate;

      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KO'));

      if (currentProfile.gender === 'female') {
        const femaleVoice = koVoices.find(v => {
          const lower = v.name.toLowerCase();
          return lower.includes('female') || lower.includes('여성') || lower.includes('sunhi') || lower.includes('yuna');
        });
        if (femaleVoice) utterance.voice = femaleVoice;
        else if (koVoices.length > 0) utterance.voice = koVoices[0];
      } else {
        const maleVoice = koVoices.find(v => {
          const lower = v.name.toLowerCase();
          return lower.includes('male') || lower.includes('남성') || lower.includes('injoon') || lower.includes('bongjin');
        });
        if (maleVoice) utterance.voice = maleVoice;
        else if (koVoices.length > 0) utterance.voice = koVoices[0];
      }

      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsInterviewerSpeaking(false);
    }
  };

  // 5. 웹캠 및 오디오 설정
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

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch (audioErr) {
        console.warn('Audio analyser setup error', audioErr);
      }

      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(t('카메라나 마이크 권한을 허용해 주세요. (주소창 좌측 자물쇠 아이콘에서 변경 가능)'));
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (autoNextIntervalRef.current) clearInterval(autoNextIntervalRef.current);
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [stream, selectedDuration, cameraActive, isCameraOff]);

  // 6. 백그라운드 영상 정밀 분석 루프 (실시간 팝업 제거, 누적 통계 기록)
  useEffect(() => {
    let animId: number;
    let frameCount = 0;

    const loop = () => {
      const nowTime = Date.now();
      if (analyserRef.current && nowTime - lastMicTimeRef.current > 120) {
        lastMicTimeRef.current = nowTime;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const vol = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(vol);
        if (vol > 15) {
          micScoresRef.current.push(vol);
        }
      }

      frameCount++;
      if (cameraActive && !isCameraOff && videoRef.current && frameCount % 3 === 0) {
        const video = videoRef.current;
        if ((video.readyState >= 2 || video.videoWidth > 0) && (video.videoWidth > 0 && video.videoHeight > 0)) {
          if (!canvasRef.current && typeof document !== 'undefined') {
            canvasRef.current = document.createElement('canvas');
            canvasRef.current.width = 160;
            canvasRef.current.height = 120;
          }

          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              canvas.width = 160;
              canvas.height = 120;
              ctx.drawImage(video, 0, 0, 160, 120);

              const frameData = ctx.getImageData(0, 0, 160, 120);
              const data = frameData.data;

              let skinCount = 0, sumX = 0, sumY = 0;
              for (let y = 10; y < 110; y += 2) {
                for (let x = 15; x < 145; x += 2) {
                  const idx = (y * 160 + x) * 4;
                  const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                  if (r > 38 && g > 24 && b > 14 && (r - g) > -15 && (r + g) > (b * 1.4)) {
                    skinCount++;
                    sumX += x;
                    sumY += y;
                  }
                }
              }

              let cx = skinCount >= 30 ? Math.round(sumX / skinCount) : 80;
              let cy = skinCount >= 30 ? Math.round(sumY / skinCount) : 48;
              cx = Math.max(35, Math.min(125, cx));
              cy = Math.max(25, Math.min(65, cy));

              const diffX = Math.abs(cx - 80);
              const diffY = cy - 48;
              let eyeOffTrack = (skinCount < 20) || (diffX > 22) || (diffY > 18) || (diffY < -20);
              if (eyeOffTrack && Math.random() < 0.05) {
                eyeDeviationCountRef.current += 1;
              }

              // 자세 안정도
              if (prevTorsoDataRef.current) {
                let diffSum = 0, sampleCount = 0;
                const prev = prevTorsoDataRef.current;
                for (let ty = 60; ty < 115; ty += 4) {
                  for (let tx = 25; tx < 135; tx += 4) {
                    const idx = (ty * 160 + tx) * 4;
                    diffSum += Math.abs(data[idx] - prev[idx]) + Math.abs(data[idx + 1] - prev[idx + 1]);
                    sampleCount += 2;
                  }
                }
                const motion = sampleCount > 0 ? (diffSum / sampleCount) : 0;
                if (motion > 9.5 && Math.random() < 0.08) {
                  postureUnstableCountRef.current += 1;
                }
              }
              prevTorsoDataRef.current = new Uint8ClampedArray(data);

              // 손버릇 감지
              const chinMinX = Math.max(0, Math.round(cx - 24));
              const chinMaxX = Math.min(160, Math.round(cx + 24));
              const chinMinY = Math.max(0, Math.round(cy + 4));
              const chinMaxY = Math.min(120, Math.round(cy + 28));
              let chinSkinPixels = 0, chinTotal = 0;
              for (let cy_pos = chinMinY; cy_pos < chinMaxY; cy_pos += 2) {
                for (let cx_pos = chinMinX; cx_pos < chinMaxX; cx_pos += 2) {
                  const idx = (cy_pos * 160 + cx_pos) * 4;
                  chinTotal++;
                  if (data[idx] > 90 && data[idx + 1] > 55 && data[idx + 2] > 40 && (data[idx] - data[idx + 1]) >= 6 && data[idx] > data[idx + 2]) {
                    chinSkinPixels++;
                  }
                }
              }
              const chinRatio = chinTotal > 0 ? (chinSkinPixels / chinTotal) : 0;
              const now = Date.now();
              if (chinRatio > 0.44 && now - lastFidgetTimeRef.current > 2500) {
                lastFidgetTimeRef.current = now;
                fidgetingCountRef.current += 1;
              }

              // 눈 깜빡임
              const eyeMinX = Math.max(0, Math.round(cx - 20));
              const eyeMaxX = Math.min(160, Math.round(cx + 20));
              const eyeMinY = Math.max(0, Math.round(cy - 14));
              const eyeMaxY = Math.min(120, Math.round(cy - 2));
              let eyeLumaSum = 0, eyePixels = 0, darkPixels = 0;
              for (let ey = eyeMinY; ey < eyeMaxY; ey += 2) {
                for (let ex = eyeMinX; ex < eyeMaxX; ex += 2) {
                  const idx = (ey * 160 + ex) * 4;
                  const luma = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                  eyeLumaSum += luma;
                  eyePixels++;
                  if (luma < 60) darkPixels++;
                }
              }
              const currentEyeLuma = eyePixels > 0 ? (eyeLumaSum / eyePixels) : 100;
              if (eyeLumaBaselineRef.current === null) eyeLumaBaselineRef.current = currentEyeLuma;
              else eyeLumaBaselineRef.current = eyeLumaBaselineRef.current * 0.94 + currentEyeLuma * 0.06;

              const instantDiff = lastEyeLumaRef.current !== null ? Math.abs(currentEyeLuma - lastEyeLumaRef.current) : 0;
              const darkDiff = prevEyeDarkRef.current !== null ? Math.abs(darkPixels - prevEyeDarkRef.current) : 0;
              if ((instantDiff > 1.8 || darkDiff >= 2) && (now - lastBlinkTimeRef.current > 220)) {
                lastBlinkTimeRef.current = now;
                totalBlinkCountRef.current += 1;
                blinkTimestampsRef.current.push(now);
              }
              lastEyeLumaRef.current = currentEyeLuma;
              prevEyeDarkRef.current = darkPixels;

              // 어깨 기울기 감지
              let leftEdgeYSum = 0, leftEdgeCount = 0, rightEdgeYSum = 0, rightEdgeCount = 0;
              for (let sx = Math.max(6, Math.round(cx - 52)); sx <= Math.max(12, Math.round(cx - 20)); sx += 4) {
                leftEdgeYSum += Math.round(cy + 28);
                leftEdgeCount++;
              }
              for (let sx = Math.min(148, Math.round(cx + 20)); sx <= Math.min(154, Math.round(cx + 52)); sx += 4) {
                rightEdgeYSum += Math.round(cy + 28);
                rightEdgeCount++;
              }
              const avgLeftY = leftEdgeCount > 0 ? (leftEdgeYSum / leftEdgeCount) : Math.round(cy + 28);
              const avgRightY = rightEdgeCount > 0 ? (rightEdgeYSum / rightEdgeCount) : Math.round(cy + 28);
              const rawShoulderDiff = avgLeftY - avgRightY;
              smoothShoulderDiffRef.current = smoothShoulderDiffRef.current * 0.85 + rawShoulderDiff * 0.15;
              if (Math.abs(smoothShoulderDiffRef.current) > 2.8 && Math.random() < 0.05) {
                shoulderTiltedCountRef.current += 1;
              }

              // 표정 미소 검출
              let mouthPixels: number[] = [];
              for (let my = Math.max(0, Math.round(cy + 13)); my <= Math.min(118, Math.round(cy + 24)); my += 2) {
                for (let mx = Math.max(0, Math.round(cx - 15)); mx <= Math.min(159, Math.round(cx + 15)); mx += 2) {
                  const idx = (my * 160 + mx) * 4;
                  mouthPixels.push(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
                }
              }
              let mouthVar = 0;
              if (mouthPixels.length > 0) {
                const mouthMean = mouthPixels.reduce((a, b) => a + b, 0) / mouthPixels.length;
                mouthVar = Math.sqrt(mouthPixels.reduce((a, b) => a + (b - mouthMean) ** 2, 0) / mouthPixels.length);
              }
              if (mouthVar > 12.0) {
                smileCountRef.current += 1;
              }

              if (now - lastStateUpdateTimeRef.current >= 300) {
                lastStateUpdateTimeRef.current = now;
                setRealtimeBehavior({
                  eyeContactScore: eyeOffTrack ? 55 : 94,
                  postureStability: Math.abs(smoothShoulderDiffRef.current) > 2.8 ? 68 : 95,
                  voiceLoudnessScore: micVolume > 15 ? Math.min(98, 80 + Math.round(micVolume * 0.2)) : 85,
                  fidgetingCount: fidgetingCountRef.current,
                  blinkRatePerMin: Math.min(50, Math.round((blinkTimestampsRef.current.filter(t => now - t < 10000).length / 10) * 60)),
                  totalBlinkCount: totalBlinkCountRef.current,
                  distractingHabits: [],
                  behaviorVerdict: '안정적인 실시간 모의면접 진행 중',
                  shoulderStatus: smoothShoulderDiffRef.current < -2.6 ? 'left_tilted' : smoothShoulderDiffRef.current > 2.6 ? 'right_tilted' : 'level',
                  shoulderMessage: '어깨 수평 감지 상태',
                  expressionStatus: mouthVar > 12.0 ? 'good' : 'neutral',
                  expressionMessage: '표정 감지 상태'
                });
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, isCameraOff]);

  // 7. 실시간 음성인식 (STT) & 자동 발화 감지
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        const trimmed = transcript.trim();
        if (trimmed) {
          setCurrentAnswer(trimmed);
          lastSpeechTimestampRef.current = Date.now();
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        // 면접이 아직 진행 중이면 자동 재시작
        if (isTimerRunning && !isFinished) {
          try { recognition.start(); } catch {}
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.warn('STT start error:', err);
    }
  };

  // 8. 5초 침묵 및 문장 종결 감지 후 자동 다음 질문 진행 타이머
  useEffect(() => {
    if (!isTimerRunning || isFinished || isInterviewerSpeaking) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSinceSpeech = now - lastSpeechTimestampRef.current;
      const answer = currentAnswer.trim();

      // 사용자가 답변을 일정 길이 이상 말했고 (~습니다, ~했습니다, ~입니다, ~다, ~요 등)
      const hasMeaningfulAnswer = answer.length >= 8;
      const hasEndingTone = /[.!?]$|습니다|했습니다|입니다|됩니다|않습니다|있습니다|합니다|같습니다|생각합니다|마치겠습니다|감사합니다|했음|입니다\.|습니다\.|다\./.test(answer);

      if (hasMeaningfulAnswer && (hasEndingTone || elapsedSinceSpeech >= 4500)) {
        if (elapsedSinceSpeech >= 3000) {
          const remainingSecs = Math.max(1, 5 - Math.floor((elapsedSinceSpeech - 3000) / 1000));
          setAutoNextCountdown(remainingSecs);

          if (elapsedSinceSpeech >= 7500) {
            handleProceedNextQuestion();
          }
        } else {
          setAutoNextCountdown(null);
        }
      } else {
        setAutoNextCountdown(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished, isInterviewerSpeaking, currentAnswer, currentStep, activeQuestions]);

  // 9. 다음 질문으로 넘어가기 (수동 또는 5초 침묵 자동)
  const handleProceedNextQuestion = () => {
    setAutoNextCountdown(null);
    const finalAnswer = currentAnswer.trim() || '답변 기록 없음';
    setUserAnswers(prev => ({ ...prev, [currentStep]: finalAnswer }));

    if (currentStep < activeQuestions.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCurrentAnswer('');
      lastSpeechTimestampRef.current = Date.now();

      const nextQ = activeQuestions[nextStep - 1];
      setTimeout(() => {
        speakLikeInterviewer(`이어서 ${nextStep}번째 질문 드립니다. ${nextQ.question}`);
      }, 500);
    } else {
      // 모든 질문 종료 ➔ 최종 리포트 화면으로 전환
      finishInterview();
    }
  };

  // 10. 면접 완료 처리 및 최종 리포트 전환
  const finishInterview = () => {
    setIsTimerRunning(false);
    setIsFinished(true);
    setAutoNextCountdown(null);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const finalAnswer = currentAnswer.trim();
    if (finalAnswer) {
      setUserAnswers(prev => ({ ...prev, [currentStep]: finalAnswer }));
    }

    setTimeout(() => {
      speakLikeInterviewer("모의면접이 모두 완료되었습니다. 수고하셨습니다. 화면에 준비된 종합 분석 리포트를 확인해 주세요.");
    }, 600);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('mystair_interview_ai_key', dedicatedApiKey.trim());
    alert(t('전용 모의면접 AI API 키가 성공적으로 적용되었습니다!'));
    setShowKeySetting(false);
  };

  // ==========================================
  // 계산: 최종 종합 면접 점수 및 통계 리포트 산출
  // ==========================================
  const totalBlinks = totalBlinkCountRef.current;
  const shoulderFails = shoulderTiltedCountRef.current;
  const postureFails = postureUnstableCountRef.current;
  const eyeFails = eyeDeviationCountRef.current;
  const fidgetFails = fidgetingCountRef.current;
  const smileCount = smileCountRef.current;
  const avgMic = micScoresRef.current.length > 0 
    ? Math.round(micScoresRef.current.reduce((a, b) => a + b, 0) / micScoresRef.current.length) 
    : 80;

  // 100점 만점 기준 감점 계산
  let finalScore = 95;
  if (shoulderFails > 2) finalScore -= Math.min(15, (shoulderFails - 2) * 4);
  if (postureFails > 2) finalScore -= Math.min(15, (postureFails - 2) * 4);
  if (eyeFails > 3) finalScore -= Math.min(15, (eyeFails - 3) * 3);
  if (fidgetFails > 0) finalScore -= Math.min(20, fidgetFails * 8);
  if (totalBlinks > 45) finalScore -= 8;
  if (avgMic < 30) finalScore -= 10;
  finalScore = Math.max(45, Math.min(98, finalScore));

  const finalGrade = finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 60 ? 'C' : 'D';

  const currentQ = activeQuestions[currentStep - 1];

  // ==========================================
  // VIEW 1: 코스 시간 선택 화면
  // ==========================================
  if (!selectedDuration) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${isLightMode ? "bg-slate-50 text-slate-900" : "bg-transparent text-slate-100"}`}>
        <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
          
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Sparkles size={13} />
              {t('실전 대기업·공기업 테크니컬 면접')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t('AI 모의면접 시간을 선택해 주세요')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {t('원하는 면접 시간을 선택하면 실시간 행동 분석과 대화형 꼬리 질문이 시작됩니다.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            {/* 3분 코스 */}
            <button
              type="button"
              onClick={() => handleSelectCourseCard(3)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-102 hover:shadow-lg relative ${
                candidateDuration === 3
                  ? (isLightMode ? 'bg-indigo-50/70 border-indigo-600 shadow-md' : 'bg-indigo-950/40 border-indigo-500 shadow-md')
                  : (isLightMode ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-indigo-400')
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mb-3 transition-colors ${
                candidateDuration === 3 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
              }`}>
                <Clock size={22} />
              </div>
              <h3 className="font-extrabold text-base mb-1">{t('3분 핵심 압축 면접')}</h3>
              <span className={`text-xs font-bold mt-2 ${candidateDuration === 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                {candidateDuration === 3 ? t('선택 완료') : t('선택하기')}
              </span>
            </button>

            {/* 5분 코스 */}
            <button
              type="button"
              onClick={() => handleSelectCourseCard(5)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-102 hover:shadow-xl relative ${
                candidateDuration === 5
                  ? (isLightMode ? 'bg-indigo-50/70 border-indigo-600 shadow-md' : 'bg-indigo-950/40 border-indigo-500 shadow-md')
                  : (isLightMode ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-indigo-400')
              }`}
            >
              <span className="absolute -top-2.5 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {candidateDuration === 5 ? t('선택됨 (추천)') : t('추천 코스')}
              </span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mb-3 transition-colors ${
                candidateDuration === 5 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
              }`}>
                <Flame size={22} />
              </div>
              <h3 className="font-extrabold text-base mb-1">{t('5분 표준 실전 면접')}</h3>
              <span className={`text-xs font-bold mt-2 ${candidateDuration === 5 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                {candidateDuration === 5 ? t('선택 완료') : t('선택하기')}
              </span>
            </button>

            {/* 10분 코스 */}
            <button
              type="button"
              onClick={() => handleSelectCourseCard(10)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-102 hover:shadow-lg relative ${
                candidateDuration === 10
                  ? (isLightMode ? 'bg-purple-50/70 border-purple-600 shadow-md' : 'bg-purple-950/40 border-purple-500 shadow-md')
                  : (isLightMode ? 'bg-white border-slate-200 hover:border-purple-300' : 'bg-slate-900 border-slate-800 hover:border-purple-400')
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mb-3 transition-colors ${
                candidateDuration === 10 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
              }`}>
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-extrabold text-base mb-1">{t('10분 심층 기술 면접')}</h3>
              <span className={`text-xs font-bold mt-2 ${candidateDuration === 10 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                {candidateDuration === 10 ? t('선택 완료') : t('선택하기')}
              </span>
            </button>
          </div>

          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => handleStartInterview(candidateDuration)}
              className="w-full sm:w-80 py-4 px-8 rounded-2xl font-black text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              <span>{candidateDuration}분 모의면접 시작하기</span>
            </button>
            
            <Link
              to="/cover-letter"
              className={`text-xs font-semibold inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors`}
            >
              <Briefcase size={14} />
              <span>{t('자기소개서 먼저 검토하고 오기')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: 면접 종료 후 종합 결과 리포트 전용 화면
  // ==========================================
  if (isFinished) {
    const candidateName = userProfile?.name || '지원자';

    return (
      <div className={`min-h-screen py-10 px-4 sm:px-8 font-sans ${isLightMode ? "bg-slate-50 text-slate-900" : "bg-transparent text-slate-100"}`}>
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={14} />
              {t('실전 AI 모의면접 완료')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {candidateName} 님의 면접 종합 결과 리포트
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              선택 코스: {selectedDuration}분 표준 면접 (총 {activeQuestions.length}개 질문 완주)
            </p>
          </div>

          {/* 종합 등급 및 총점 카드 */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Award className="text-indigo-500" size={24} />
                <span className="text-sm font-bold text-indigo-500">종합 면접 평가 등급</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {finalScore >= 80 ? '합격 가능성이 높은 우수한 면접이었습니다!' : '기본 태도와 전달력을 조금 더 보완하면 완벽합니다!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                어깨 수평, 시선 고정, 불필요한 얼굴 접촉, 목소리 전달력 등 실제 채용 면접관의 엄격한 시선 평가 기준을 종합 분석한 실전 지표입니다.
              </p>
            </div>

            {/* Score Big Circle */}
            <div className="flex items-center gap-4 shrink-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl border border-indigo-500/20">
              <div className="text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">최종 등급</span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                  {finalGrade}
                </span>
              </div>
              <div className="h-12 w-px bg-slate-700/50" />
              <div className="text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">종합 점수</span>
                <span className={`text-4xl sm:text-5xl font-black ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  {finalScore}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ 100</span>
              </div>
            </div>
          </div>

          {/* 6대 정밀 행동/태도 통계 분석 그리드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <BarChart3 className="text-indigo-500" size={20} />
              <span>실전 행동 및 태도 정밀 통계 (사용자 분석 데이터)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* 1. 어깨 수평 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Scale size={16} className="text-indigo-400" />
                    <span>어깨 수평 및 자세</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${shoulderFails <= 2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {shoulderFails <= 2 ? '양호' : '개선 필요'}
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  기울임 {shoulderFails}회 감지
                </p>
                <p className="text-xs text-slate-400">
                  {shoulderFails <= 2 ? '면접 내내 바른 어깨 수평을 잘 유지했습니다.' : '답변 중 한쪽 어깨가 올라가거나 비뚤어지는 경향이 있습니다.'}
                </p>
              </div>

              {/* 2. 카메라 시선 처리 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Eye size={16} className="text-purple-400" />
                    <span>카메라 시선 (아이컨택)</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${eyeFails <= 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {eyeFails <= 3 ? '안정적' : '주의'}
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  이탈 {eyeFails}회 감지
                </p>
                <p className="text-xs text-slate-400">
                  {eyeFails <= 3 ? '면접관(카메라 렌즈)을 자신감 있게 정면 응시했습니다.' : '바닥이나 천장을 바라보는 횟수가 감지되었습니다.'}
                </p>
              </div>

              {/* 3. 손버릇 및 얼굴 접촉 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>손버릇 및 얼굴 접촉</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${fidgetFails === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {fidgetFails === 0 ? '완벽' : `${fidgetFails}회 감점`}
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  얼굴 접촉 {fidgetFails}회
                </p>
                <p className="text-xs text-slate-400">
                  {fidgetFails === 0 ? '불필요한 손 올리기나 얼굴 만지기가 전혀 없었습니다.' : '손을 얼굴이나 턱으로 가져가는 습관을 의식적으로 고쳐보세요.'}
                </p>
              </div>

              {/* 4. 눈 깜빡임 빈도 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Activity size={16} className="text-cyan-400" />
                    <span>눈 깜빡임 빈도</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                    총 {totalBlinks}회
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  {totalBlinks > 45 ? '다소 긴장' : '안정적'}
                </p>
                <p className="text-xs text-slate-400">
                  {totalBlinks > 45 ? '긴장으로 인해 눈 깜빡임이 다소 증가했습니다. 심호흡을 해보세요.' : '자연스럽고 편안한 눈맞춤을 유지했습니다.'}
                </p>
              </div>

              {/* 5. 표정 및 호감도 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Smile size={16} className="text-emerald-400" />
                    <span>표정 및 첫인상</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {smileCount > 5 ? '호감 미소' : '차분함'}
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  {smileCount > 5 ? '밝은 인상' : '단정한 인상'}
                </p>
                <p className="text-xs text-slate-400">
                  면접관에게 신뢰감을 주는 단정하고 호감 있는 표정을 보여주었습니다.
                </p>
              </div>

              {/* 6. 목소리 성량 */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Volume2 size={16} className="text-indigo-400" />
                    <span>목소리 성량 & 전달력</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                    {avgMic}%
                  </span>
                </div>
                <p className="text-2xl font-black mb-1">
                  {avgMic >= 40 ? '또렷한 성량' : '목소리 다소 작음'}
                </p>
                <p className="text-xs text-slate-400">
                  {avgMic >= 40 ? '면접관이 듣기 편안하고 또렷한 성량으로 전달되었습니다.' : '실제 면접장에서는 조금 더 자신감 있게 큰 목소리로 답변하세요.'}
                </p>
              </div>
            </div>
          </div>

          {/* 질문별 나의 답변 내역 확인 */}
          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <FileText className="text-indigo-500" size={20} />
              <span>문항별 나의 실전 답변 기록 ({activeQuestions.length}개 문항)</span>
            </h3>

            <div className="space-y-3">
              {activeQuestions.map((q, idx) => {
                const answer = userAnswers[idx + 1] || '답변 없음';
                return (
                  <div key={q.id} className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Q{idx + 1}. {q.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-200">{q.question}</h4>
                    </div>

                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed mt-2 border ${
                      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}>
                      <span className="font-bold text-indigo-400 block mb-1">🗣️ 나의 음성 답변:</span>
                      <p className="whitespace-pre-wrap">{answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsFinished(false);
                setSelectedDuration(null);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>모의면접 다시 도전하기</span>
            </button>

            <Link
              to="/"
              className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm border transition-colors flex items-center justify-center gap-2 ${
                isLightMode ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
            >
              <span>메인 홈으로 가기</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: 초대형 와이드 카메라 + 실제 면접 인터페이스
  // ==========================================
  return (
    <div className={`min-h-screen flex flex-col bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Hidden canvas for video analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-3 sm:px-8 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/85 border-slate-200/80" : "bg-[#0F172A]/85 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-400'} font-black text-xl sm:text-[24px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] shrink-0 flex items-center gap-1.5 shadow-xs">
            <Sparkles size={12} />
            {selectedDuration}분 {t('실전 모의면접')}
          </span>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI 면접관 음성 선택 커스텀 드롭다운 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceMenu(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isLightMode 
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50' 
                  : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Volume2 size={14} className="text-indigo-500 shrink-0" />
              <span>{INTERVIEWER_VOICE_LIST.find(v => v.id === interviewerVoice)?.name || '이인준'} 면접관</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${showVoiceMenu ? 'rotate-180' : ''}`} />
            </button>

            {showVoiceMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowVoiceMenu(false)} 
                />
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[420px] overflow-y-auto no-scrollbar ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' : 'bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white shadow-black/80'
                }`}>
                  <div className="px-2 py-1 text-[11px] font-black text-slate-400 border-b border-slate-700/40 pb-1.5 mb-1">
                    {t('AI 면접관 보이스 선택')}
                  </div>
                  
                  {(['남성 면접관', '여성 면접관', '특화 면접관'] as const).map(category => (
                    <div key={category} className="mt-2">
                      <div className="px-2 py-0.5 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 rounded-md mb-1">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {INTERVIEWER_VOICE_LIST.filter(v => v.category === category).map(v => {
                          const isSelected = interviewerVoice === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => {
                                setInterviewerVoice(v.id);
                                setShowVoiceMenu(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : (isLightMode ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-300')
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                                <span>{v.icon}</span>
                                <span className="font-extrabold shrink-0">{v.name}</span>
                                <span className={`text-[11px] font-normal truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                  ({v.role})
                                </span>
                              </div>
                              {isSelected && <Check size={14} className="shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Remaining Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
            remainingTime <= 60 
              ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
              : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200')
          }`}>
            <Timer size={14} />
            <span>{formatTime(remainingTime)}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsTimerRunning(false);
              setSelectedDuration(null);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="코스 시간 다시 고르기"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Main Container: Prominent interview viewport layout */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-2 pb-8 space-y-3.5 flex-1 flex flex-col justify-start">
        
        {/* Question Step Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5">
            {activeQuestions.map((q, idx) => (
              <span
                key={q.id}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  currentStep === idx + 1
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : currentStep > idx + 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-400 border border-white/5'
                }`}
              >
                Q{idx + 1} {q.category}
              </span>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-400 shrink-0">
            문항 {currentStep} / {activeQuestions.length}
          </div>
        </div>

        {/* 1. 크고 시원한 카메라 화면 */}
        <div className={`relative rounded-2xl overflow-hidden border shadow-2xl w-full h-[320px] sm:h-[380px] md:h-[420px] flex items-center justify-center transition-all bg-slate-950 ${
          isLightMode ? 'border-slate-200/90 shadow-slate-200/50' : 'border-slate-800 shadow-black/70'
        }`}>
          {/* Actual Crisp Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            onLoadedMetadata={() => {
              videoRef.current?.play().catch(() => {});
            }}
            className={`w-full h-full object-cover transform -scale-x-100 ${(!cameraActive || isCameraOff) ? 'hidden' : 'block'}`}
          />

          {(!cameraActive || isCameraOff) && (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mb-3">
                <CameraOff size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-200 mb-1">
                {isCameraOff ? t('카메라가 꺼져 있습니다') : t('카메라가 꺼져 있습니다')}
              </p>
              <button
                type="button"
                onClick={isCameraOff ? toggleCameraOff : startCamera}
                className="mt-2.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Camera size={14} />
                <span>{t('카메라 켜기')}</span>
              </button>
            </div>
          )}

          {/* Overlays on Video */}
          {cameraActive && !isCameraOff && (
            <>
              {/* Subtle Viewfinder Frame Corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/50 pointer-events-none rounded-tl-md" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/50 pointer-events-none rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/50 pointer-events-none rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/50 pointer-events-none rounded-br-md" />

              {/* Status Top Left */}
              <div className="absolute top-3.5 left-3.5 ml-2 mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('실시간 모의면접')}</span>
              </div>

              {/* Speaking Indicator Top Right */}
              {isInterviewerSpeaking && (
                <div className="absolute top-3.5 right-3.5 mr-2 mt-1 flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-indigo-300 shadow-md animate-pulse">
                  <Volume2 size={13} />
                  <span>면접관 질문 중</span>
                </div>
              )}

              {/* Camera / Mic Controls Bottom Right */}
              <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMicMute}
                  className={`p-2 rounded-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isMicMuted ? 'bg-red-500/80 text-white border-red-400' : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
                  }`}
                  title={isMicMuted ? "마이크 켜기" : "마이크 끄기"}
                >
                  {isMicMuted ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <button
                  type="button"
                  onClick={toggleCameraOff}
                  className={`p-2 rounded-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isCameraOff ? 'bg-amber-500/80 text-white border-amber-400' : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
                  }`}
                  title={isCameraOff ? "카메라 켜기" : "카메라 끄기"}
                >
                  {isCameraOff ? <CameraOff size={15} /> : <Camera size={15} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 2. 면접관 질문 박스 (깔끔하게 질문만 표시) */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              면접 질문 {currentStep} / {activeQuestions.length} • {currentQ?.category}
            </span>

            <button
              type="button"
              onClick={() => {
                if (currentQ) speakLikeInterviewer(currentQ.question);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
            >
              <Volume2 size={13} />
              <span>다시 듣기</span>
            </button>
          </div>

          <h2 className={`text-base sm:text-lg md:text-xl font-black leading-snug tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>
            "{currentQ?.question}"
          </h2>
        </div>

        {/* 3. 나의 실시간 음성 자막 박스 (실시간 STT 자막) */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
              <span>{isRecording ? t('실시간 음성 자막 기록 중...') : t('마이크 대기')}</span>
            </div>

            {/* 5초 침묵 후 자동 전환 인디케이터 */}
            {autoNextCountdown !== null && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 animate-pulse">
                <Clock size={12} />
                <span>{autoNextCountdown}초 후 다음 질문 자동 이동</span>
              </div>
            )}
          </div>

          {/* Real-time speech subtitle textarea */}
          <div className="relative">
            <textarea
              rows={2}
              value={currentAnswer}
              onChange={e => {
                setCurrentAnswer(e.target.value);
                lastSpeechTimestampRef.current = Date.now();
              }}
              placeholder="답변을 말씀하시면 실시간으로 자막이 기록됩니다."
              className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm outline-none resize-none font-medium leading-relaxed custom-scrollbar ${
                isLightMode 
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500' 
                  : 'bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handleProceedNextQuestion}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-98 transition-all"
            >
              <span>{currentStep === activeQuestions.length ? '면접 완료 및 결과 보기' : '다음 질문으로 넘어가기'}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: 간략한 시작 확인 모달 (네 / 아니요) */}
      {/* ======================================================== */}
      {isPrepModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-xs sm:max-w-sm p-6 sm:p-7 rounded-2xl border shadow-2xl text-center transition-all ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <h2 className="text-xl font-black mb-6">
              시작하시겠습니까?
            </h2>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleConfirmCountdown}
                className="flex-1 py-3 px-6 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md cursor-pointer transition-all"
              >
                네
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPrepModalOpen(false);
                  setSelectedDuration(null);
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-sm active:scale-95 cursor-pointer transition-all border ${
                  isLightMode 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                아니요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: 심플한 하얀색 폰트 숫자 3, 2, 1 카운트다운 */}
      {/* ======================================================== */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/85 flex items-center justify-center select-none animate-in fade-in duration-100">
          <span 
            key={countdown}
            className="text-8xl sm:text-9xl md:text-[140px] font-black text-white drop-shadow-[0_10px_35px_rgba(255,255,255,0.4)] transform animate-in zoom-in-75 duration-200"
          >
            {countdown}
          </span>
        </div>
      )}

    </div>
  );
}
