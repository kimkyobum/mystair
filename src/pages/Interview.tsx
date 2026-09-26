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
  Minimize2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface InterviewQuestion {
  id: number;
  question: string;
  category: '기본역량' | '전공직무' | '협업태도' | '돌발위기';
  hint: string;
}

// 3분(3문항), 5분(5문항), 10분(8문항) 코스별 질문 풀
const ALL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "자기소개와 함께 우리 회사에 지원하게 된 솔직한 동기를 1분 내외로 말씀해 주세요.",
    category: "기본역량",
    hint: "마이스터고에서 배운 실무 강점과 회사의 비전에 매료된 이유를 명확하게 연결하세요."
  },
  {
    id: 2,
    question: "본인의 가장 뚜렷한 장점과, 반대로 고치려고 노력 중인 단점은 무엇인지 실제 경험을 들어 설명해 보세요.",
    category: "기본역량",
    hint: "단점은 극복하고 있는 구체적인 루틴이나 실천 방안을 제시하여 개선 의지를 보여주세요."
  },
  {
    id: 3,
    question: "학창 시절 전공 실습이나 프로젝트를 진행하면서 겪었던 가장 큰 기술적 어려움과, 이를 어떻게 극복했는지 구체적으로 설명해 주세요.",
    category: "전공직무",
    hint: "원인을 분석하고 해결책을 찾아낸 '과정'과 '배운 점'에 초점을 맞추세요."
  },
  {
    id: 4,
    question: "전공 자격증 취득이나 실습을 하면서 가장 기억에 남는 배움은 무엇이었으며, 그 경험을 하면서 친구나 조원과 의견 충돌은 없었나요?",
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
  eyeContactScore: number;       // 시선 유지도 (80~98%)
  postureStability: number;      // 자세 안정도 (85~99%)
  voiceLoudnessScore: number;    // 목소리 크기 및 음량 성량 (75~98%)
  fidgetingCount: number;        // 손 올리기/손톱 물어뜯기/얼굴 만지기 의심 횟수
  blinkRatePerMin: number;       // 분당 눈 깜빡임 빈도 (정상: 15~20회)
  distractingHabits: string[];   // 감지된 거슬리는 산만한 행동 태그
  behaviorVerdict: string;       // 종합 행동 평가 코멘트
  shoulderStatus: 'level' | 'left_tilted' | 'right_tilted'; // 어깨 수평 상태
  shoulderMessage: string;       // 어깨 수평 피드백 메시지
  expressionStatus: 'good' | 'neutral' | 'tense';           // 표정 상태 (호감 미소/차분함/경직)
  expressionMessage: string;     // 표정 피드백 메시지
}

export default function Interview() {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();
  const { userProfile } = useAuth();

  // 면접 코스 시간 선택 모달 (null: 코스 미선택, 3 | 5 | 10: 선택됨)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [candidateDuration, setCandidateDuration] = useState<number>(5); // 카드 선택 상태 (기본 5분 추천)
  const [activeQuestions, setActiveQuestions] = useState<InterviewQuestion[]>([]);

  // 실시간 면접 제한 시간 타이머 (초 단위)
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // 사용자 지정 전용 AI API 키
  const [dedicatedApiKey, setDedicatedApiKey] = useState<string>(() => {
    return localStorage.getItem('mystair_interview_ai_key') || 'ogqc_c3ad18e9908f34113fec37e0d6362884aa4b6e25f27a48b2283db046e0c6f238';
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

  // 산만한 행동(얼굴 손대기, 손톱 물어뜯기, 눈 깜빡임) 감지 상태
  const [liveFidgetWarning, setLiveFidgetWarning] = useState<string>('');
  const lastBlinkCheckRef = useRef<number>(Date.now());
  const blinkCounterRef = useRef<number>(0);

  // 실시간 행동 및 태도 종합 지표
  const [realtimeBehavior, setRealtimeBehavior] = useState<BehaviorMetrics>({
    eyeContactScore: 92,
    postureStability: 94,
    voiceLoudnessScore: 88,
    fidgetingCount: 0,
    blinkRatePerMin: 18,
    distractingHabits: [],
    behaviorVerdict: '카메라 정면 응시와 바른 상체 자세가 안정적으로 유지되고 있습니다.',
    shoulderStatus: 'level',
    shoulderMessage: '양쪽 어깨 수평이 바르게 유지되고 있습니다.',
    expressionStatus: 'good',
    expressionMessage: '자연스럽고 편안한 호감형 표정입니다.'
  });

  // 내 화면 크기 확대 모드 (사용자 요청: 내 화면이 너무 작을 때 넓게 확장)
  const [isCameraExpanded, setIsCameraExpanded] = useState<boolean>(false);

  // 음성 인식 (STT)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 면접 단계
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // AI 피드백 및 꼬리 질문
  const [feedbacks, setFeedbacks] = useState<Record<number, {
    score: number;
    comment: string;
    followUpQuestions: string[];
    goodPoints: string[];
    improvePoints: string[];
    behaviorSummary: BehaviorMetrics;
  }>>({});

  // 꼬리 질문 답변 입력 모드
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [activeFollowUpIdx, setActiveFollowUpIdx] = useState<number | null>(null);

  // 음성 TTS 안내 (실제 사람 같은 남성 면접관 보이스)
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState<boolean>(true);
  const [interviewerVoice, setInterviewerVoice] = useState<'injoon' | 'bongjin'>('injoon');
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // 실시간 비상 경고음 & 감점 플로팅 알림 상태
  const [warningSoundEnabled, setWarningSoundEnabled] = useState<boolean>(true);
  const lastWarningAudioTimeRef = useRef<number>(0);
  const [floatingDeductions, setFloatingDeductions] = useState<{ id: number; text: string }[]>([]);
  const [recentDeductionsLog, setRecentDeductionsLog] = useState<{ id: number; text: string; time: string }[]>([]);
  const prevTorsoDataRef = useRef<Uint8ClampedArray | null>(null);
  const blinkTimestampsRef = useRef<number[]>([]);
  const lastEyeLumaRef = useRef<number | null>(null);
  const lastFidgetTimeRef = useRef<number>(0);

  // 상단 제어 바: 마이크 음소거 / 카메라 끄기 토글
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

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

  // 1. 코스 카드 선택 (즉시 시작하지 않고 후보 등록)
  const handleSelectCourseCard = (minutes: 3 | 5 | 10) => {
    setCandidateDuration(minutes);
  };

  // 정식 면접 시작 버튼 핸들러 (사용자가 시작 버튼을 누를 때 시작)
  const handleStartInterview = (minutes?: number) => {
    const targetMin = minutes || candidateDuration || 5;
    setSelectedDuration(targetMin);
    let count = 3;
    if (targetMin === 5) count = 5;
    if (targetMin === 10) count = 8;

    const chosen = ALL_QUESTIONS.slice(0, count);
    setActiveQuestions(chosen);
    setRemainingTime(targetMin * 60);
    setIsTimerRunning(true);
    setCurrentStep(1);
    setCurrentAnswer('');

    // 시작 시 카메라 자동 연결 시도
    startCamera();

    // 베테랑 면접관 오프닝 멘트
    setTimeout(() => {
      speakLikeInterviewer(`반갑습니다. 오늘 면접을 맡은 기술면접관입니다. 편안한 마음으로 임해주시되, 실제 현장이라 생각하고 또박또박 답변해 주시기 바랍니다. 첫 번째 질문 드립니다. ${chosen[0].question}`);
    }, 1000);
  };

  // Automated tour navigation synchronization
  useEffect(() => {
    const handleTourEnterInterview = () => {
      handleStartInterview(5);
    };
    const handleTourExitInterview = () => {
      setSelectedDuration(null);
    };
    window.addEventListener('tour-enter-interview', handleTourEnterInterview);
    window.addEventListener('tour-exit-interview', handleTourExitInterview);
    return () => {
      window.removeEventListener('tour-enter-interview', handleTourEnterInterview);
      window.removeEventListener('tour-exit-interview', handleTourExitInterview);
    };
  }, [candidateDuration]);

  // 2. 타이머 카운트다운
  useEffect(() => {
    if (!isTimerRunning || remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          speakLikeInterviewer("면접 제한 시간이 모두 종료되었습니다. 수고 많으셨습니다.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 실시간 비상 경고음 재생 함수 (Web Audio API)
  const playWarningTone = () => {
    if (!warningSoundEnabled) return;
    const now = Date.now();
    if (now - lastWarningAudioTimeRef.current < 2500) return; // 2.5초 디바운스
    lastWarningAudioTimeRef.current = now;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioContextRef.current || new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  };

  // 실시간 피드백 기록 (사용자 피드백 반영: 화면 가림 팝업 및 시끄러운 경고음 제거, 차분한 코칭 중심)
  const triggerDeductionAlert = (penaltyText: string) => {
    const id = Date.now() + Math.random();
    setRecentDeductionsLog(prev => {
      const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return [{ id, text: penaltyText, time: timeStr }, ...prev.slice(0, 4)];
    });
  };

  // 3. 실제 사람 같은 남성 면접관 음성(TTS) 엔진 (서버 뉴럴 보이스 + 엄격한 남성 전용 폴백)
  const speakLikeInterviewer = async (text: string) => {
    if (!voiceGuideEnabled || typeof window === 'undefined') return;

    // 이전 음성 정지
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

    // 1. 고품질 한국인 남성 뉴럴 음성 엔드포인트 직접 재생
    try {
      const audioUrl = `/api/interview-tts?text=${encodeURIComponent(cleanText)}&voice=${interviewerVoice}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsInterviewerSpeaking(false);
        activeAudioRef.current = null;
      };

      audio.onerror = async () => {
        // GET 실패 시 (긴 텍스트 등) POST 엔드포인트 시도
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
        } catch {
          // fallback below
        }
        speakWithClientFallback(cleanText);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("Direct neural audio play failed, trying client fallback", err);
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

      // 40~50대 남성 기술면접관 톤: 깊은 중저음(0.68), 단호하고 안정감 있는 템포(0.88)
      utterance.pitch = 0.68;
      utterance.rate = 0.88;

      const voices = window.speechSynthesis.getVoices();
      // 여성 음성 완전 제외 필터링 (Google 한국의, Heami, SunHi, Yuna 등 여성/로봇 배제)
      const koMaleVoices = voices.filter(v => {
        const isKo = v.lang.includes('ko') || v.lang.includes('KO');
        if (!isKo) return false;
        const lower = v.name.toLowerCase();
        const isFemale = lower.includes('female') || lower.includes('여성') || lower.includes('yuna') || lower.includes('heami') || lower.includes('sunhi') || lower.includes('google 한국의');
        return !isFemale;
      });

      // 명시적 남성 보이스 우선 매칭
      const exactMale = koMaleVoices.find(v => {
        const lower = v.name.toLowerCase();
        return lower.includes('injoon') || lower.includes('bongjin') || lower.includes('남성') || lower.includes('male') || lower.includes('gookmin');
      });

      if (exactMale) {
        utterance.voice = exactMale;
      } else if (koMaleVoices.length > 0) {
        utterance.voice = koMaleVoices[0];
      } else {
        const anyKo = voices.find(v => v.lang.includes('ko') || v.lang.includes('KO'));
        if (anyKo) utterance.voice = anyKo;
      }

      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fallback error', e);
      setIsInterviewerSpeaking(false);
    }
  };

  // 4. 웹캠 및 마이크 오디오 레벨 모니터링
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

      // Web Audio API로 마이크 음량 실시간 측정
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
    };
  }, [stream]);

  // 5. 정밀 프레임 영상 분석: 시선 이탈, 자세 흔들림, 손버릇, 눈 깜빡임 실시간 엄격 감점 루프
  useEffect(() => {
    let animId: number;
    let frameCount = 0;

    const loop = () => {
      // 1) 마이크 음량 실시간 측정
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
      }

      // 2) 비디오 프레임 행동 분석 (초당 약 8회 검출)
      frameCount++;
      if (cameraActive && !isCameraOff && videoRef.current && canvasRef.current && frameCount % 7 === 0) {
        const video = videoRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = 160;
            canvas.height = 120;
            ctx.drawImage(video, 0, 0, 160, 120);

            const frameData = ctx.getImageData(0, 0, 160, 120);
            const data = frameData.data;

            // 피부 톤 픽셀 스캔 및 얼굴 중심점(Centroid) 계산
            let skinCount = 0;
            let sumX = 0;
            let sumY = 0;
            for (let y = 10; y < 110; y += 2) {
              for (let x = 10; x < 150; x += 2) {
                const idx = (y * 160 + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // 한국인 표준 피부톤 RGB 필터링
                if (r > 75 && g > 40 && b > 25 && (r - g) >= 12 && r > b && (r - b) >= 10 && Math.abs(r - g) < 115) {
                  skinCount++;
                  sumX += x;
                  sumY += y;
                }
              }
            }

            let eyeOffTrack = false;
            let postureUnstable = false;
            let fidgetDetected = false;
            let blinkRapid = false;
            let currentShoulderStatus: 'level' | 'left_tilted' | 'right_tilted' = 'level';
            let currentShoulderMessage = '양쪽 어깨 수평이 바르게 유지되고 있습니다.';
            let currentExprStatus: 'good' | 'neutral' | 'tense' = 'neutral';
            let currentExprMessage = '차분하고 진중한 기본 표정입니다.';
            const reasons: string[] = [];

            // A. 카메라 시선 분석 (Gaze & Centroid) - 조금만 딴 데 봐도 확확 감점
            if (skinCount < 300) {
              // 화면에서 얼굴이 벗어나거나 너무 멀어짐
              eyeOffTrack = true;
              reasons.push('화면 이탈 (얼굴 미감지)');
            } else {
              const cx = sumX / skinCount;
              const cy = sumY / skinCount;

              // 좌우 이탈 검출 (화면 가로 160 중 중심은 80, 16px 이상 벗어나면 시선 이탈)
              const diffX = Math.abs(cx - 80);
              // 상하 이탈 검출 (중심은 52, 14px 이상 벗어나면 바닥/천장 응시)
              const diffY = cy - 52;

              if (diffX > 16) {
                eyeOffTrack = true;
                reasons.push(cx < 80 ? '카메라 좌측 시선 이탈' : '카메라 우측 시선 이탈');
              } else if (diffY > 14) {
                eyeOffTrack = true;
                reasons.push('시선 하향 이탈 (바닥/메모/키보드 응시)');
              } else if (diffY < -16) {
                eyeOffTrack = true;
                reasons.push('시선 상향 이탈 (천장/먼산 응시)');
              }

              // B. 자세 안정도 분석 (Torso Motion Variance) - 몸 조금만 흔들려도 엄격 감점
              if (prevTorsoDataRef.current) {
                let diffSum = 0;
                let sampleCount = 0;
                const prev = prevTorsoDataRef.current;
                for (let ty = 60; ty < 115; ty += 3) {
                  for (let tx = 25; tx < 135; tx += 3) {
                    const idx = (ty * 160 + tx) * 4;
                    diffSum += Math.abs(data[idx] - prev[idx]) + Math.abs(data[idx + 1] - prev[idx + 1]);
                    sampleCount += 2;
                  }
                }
                const motion = sampleCount > 0 ? (diffSum / sampleCount) : 0;
                if (motion > 11) {
                  postureUnstable = true;
                  reasons.push('상체 흔들림 및 자세 불안정');
                }
              }
              prevTorsoDataRef.current = new Uint8ClampedArray(data);

              // C. 손버릇 감지 (턱/입/얼굴/손톱 만지는 동작) - 민감도 대폭 강화
              const chinMinX = Math.max(0, Math.round(cx - 24));
              const chinMaxX = Math.min(160, Math.round(cx + 24));
              const chinMinY = Math.max(0, Math.round(cy + 4));
              const chinMaxY = Math.min(120, Math.round(cy + 28));

              let chinSkinPixels = 0;
              let chinTotal = 0;
              for (let cy_pos = chinMinY; cy_pos < chinMaxY; cy_pos += 2) {
                for (let cx_pos = chinMinX; cx_pos < chinMaxX; cx_pos += 2) {
                  const idx = (cy_pos * 160 + cx_pos) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  chinTotal++;
                  if (r > 120 && g > 80 && b > 65 && (r - g) >= 10 && r > b) {
                    chinSkinPixels++;
                  }
                }
              }
              const chinRatio = chinTotal > 0 ? (chinSkinPixels / chinTotal) : 0;
              const now = Date.now();
              if (chinRatio > 0.44) {
                if (now - lastFidgetTimeRef.current > 1800) {
                  fidgetDetected = true;
                  lastFidgetTimeRef.current = now;
                  triggerDeductionAlert('🚨 손버릇 감지 -30점 (얼굴/턱 만짐)');
                }
                reasons.push('얼굴/턱/손톱 만지는 산만한 손버릇');
              }

              // D. 눈 깜빡임 빈도 측정 (Eye Band Luminance Variation)
              const eyeMinX = Math.max(0, Math.round(cx - 18));
              const eyeMaxX = Math.min(160, Math.round(cx + 18));
              const eyeMinY = Math.max(0, Math.round(cy - 14));
              const eyeMaxY = Math.min(120, Math.round(cy - 3));

              let eyeLumaSum = 0;
              let eyePixels = 0;
              for (let ey = eyeMinY; ey < eyeMaxY; ey += 2) {
                for (let ex = eyeMinX; ex < eyeMaxX; ex += 2) {
                  const idx = (ey * 160 + ex) * 4;
                  eyeLumaSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                  eyePixels++;
                }
              }
              const currentEyeLuma = eyePixels > 0 ? (eyeLumaSum / eyePixels) : 100;
              if (lastEyeLumaRef.current !== null) {
                const lumaDiff = Math.abs(currentEyeLuma - lastEyeLumaRef.current);
                if (lumaDiff > 12) {
                  const lastBlink = blinkTimestampsRef.current[blinkTimestampsRef.current.length - 1] || 0;
                  if (now - lastBlink > 200) {
                    blinkTimestampsRef.current.push(now);
                  }
                }
              }
              lastEyeLumaRef.current = currentEyeLuma;

              // 12초 슬라이딩 윈도우로 분당 깜빡임 환산
              blinkTimestampsRef.current = blinkTimestampsRef.current.filter(t => now - t < 12000);
              const currentBlinkRate = Math.round((blinkTimestampsRef.current.length / 12) * 60);
              if (currentBlinkRate > 24) {
                blinkRapid = true;
                reasons.push(`긴장성 눈 깜빡임 과다 (${currentBlinkRate}회/분)`);
              }

              // E. 어깨 수평 분석 (Shoulder Horizontal Alignment)
              let leftShoulderSumY = 0;
              let leftCount = 0;
              let rightShoulderSumY = 0;
              let rightCount = 0;

              const shoulderStartY = Math.max(0, Math.round(cy + 18));
              const shoulderEndY = Math.min(118, Math.round(cy + 52));

              // 좌측 어깨 탑 에지 스캔 (화면상 왼쪽 x < cx)
              for (let sx = Math.max(8, Math.round(cx - 45)); sx <= Math.max(14, Math.round(cx - 20)); sx += 3) {
                for (let sy = shoulderStartY; sy < shoulderEndY; sy += 2) {
                  const idx = (sy * 160 + sx) * 4;
                  if (data[idx] + data[idx + 1] + data[idx + 2] > 70) {
                    leftShoulderSumY += sy;
                    leftCount++;
                    break;
                  }
                }
              }
              // 우측 어깨 탑 에지 스캔 (화면상 오른쪽 x > cx)
              for (let sx = Math.min(146, Math.round(cx + 20)); sx <= Math.min(152, Math.round(cx + 45)); sx += 3) {
                for (let sy = shoulderStartY; sy < shoulderEndY; sy += 2) {
                  const idx = (sy * 160 + sx) * 4;
                  if (data[idx] + data[idx + 1] + data[idx + 2] > 70) {
                    rightShoulderSumY += sy;
                    rightCount++;
                    break;
                  }
                }
              }

              currentShoulderStatus = 'level';
              currentShoulderMessage = '양쪽 어깨 수평이 바르게 유지되고 있습니다.';
              if (leftCount >= 2 && rightCount >= 2) {
                const avgLeft = leftShoulderSumY / leftCount;
                const avgRight = rightShoulderSumY / rightCount;
                const diff = avgLeft - avgRight;
                if (diff < -4.5) {
                  currentShoulderStatus = 'left_tilted';
                  currentShoulderMessage = '왼쪽 어깨가 약간 올라가 있습니다. 양쪽 수평을 맞춰보세요.';
                  reasons.push('왼쪽 어깨 기울어짐');
                } else if (diff > 4.5) {
                  currentShoulderStatus = 'right_tilted';
                  currentShoulderMessage = '오른쪽 어깨가 약간 올라가 있습니다. 양쪽 수평을 맞춰보세요.';
                  reasons.push('오른쪽 어깨 기울어짐');
                } else {
                  currentShoulderStatus = 'level';
                  currentShoulderMessage = '양쪽 어깨 수평이 단정하게 유지되고 있습니다.';
                }
              }

              // F. 표정 및 입가 미소/경직 분석 (Facial Expression Analysis)
              let mouthLumaSum = 0;
              let mouthCount = 0;
              let cheekLumaSum = 0;
              let cheekCount = 0;

              const mouthY1 = Math.max(0, Math.round(cy + 12));
              const mouthY2 = Math.min(118, Math.round(cy + 24));
              const mouthX1 = Math.max(0, Math.round(cx - 15));
              const mouthX2 = Math.min(159, Math.round(cx + 15));

              for (let my = mouthY1; my <= mouthY2; my += 2) {
                for (let mx = mouthX1; mx <= mouthX2; mx += 2) {
                  const idx = (my * 160 + mx) * 4;
                  mouthLumaSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                  mouthCount++;
                }
              }

              for (let cky = Math.max(0, Math.round(cy + 6)); cky <= Math.min(118, Math.round(cy + 16)); cky += 2) {
                for (let ckx of [Math.max(0, Math.round(cx - 16)), Math.min(159, Math.round(cx + 16))]) {
                  const idx = (cky * 160 + ckx) * 4;
                  cheekLumaSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                  cheekCount++;
                }
              }

              const avgMouthLuma = mouthCount > 0 ? mouthLumaSum / mouthCount : 100;
              const avgCheekLuma = cheekCount > 0 ? cheekLumaSum / cheekCount : 100;

              currentExprStatus = 'neutral';
              currentExprMessage = '차분하고 진중한 기본 표정입니다.';
              if (avgCheekLuma > 115 || (avgMouthLuma > 105 && avgMouthLuma < 155)) {
                currentExprStatus = 'good';
                currentExprMessage = '자연스럽고 밝은 미소로 호감도가 높습니다.';
              } else if (avgMouthLuma < 72 || avgCheekLuma < 75) {
                currentExprStatus = 'tense';
                currentExprMessage = '표정이 다소 굳어 있습니다. 입꼬리를 살짝 올려 부드러운 인상을 보여주세요.';
                reasons.push('긴장된 굳은 표정');
              } else {
                currentExprStatus = 'neutral';
                currentExprMessage = '차분하고 신뢰감을 주는 안정적인 표정입니다.';
              }
            }

            // 실시간 상태 반영 및 코칭 업데이트
            setRealtimeBehavior(prev => {
              let newEye = prev.eyeContactScore;
              if (eyeOffTrack) {
                newEye = Math.max(22, prev.eyeContactScore - 18);
              } else {
                newEye = Math.min(97, prev.eyeContactScore + 1.5);
              }

              let newPosture = prev.postureStability;
              if (postureUnstable) {
                newPosture = Math.max(25, prev.postureStability - 18);
              } else {
                newPosture = Math.min(96, prev.postureStability + 1.5);
              }

              const newFidgetCount = fidgetDetected ? prev.fidgetingCount + 1 : prev.fidgetingCount;

              let verdict = '카메라 정면 응시와 바른 상체 자세가 안정적으로 유지되고 있습니다.';
              if (reasons.length > 0) {
                verdict = `${reasons.join(', ')} 감지됨. 차분하게 호흡하며 자세를 유지하세요.`;
              }

              return {
                eyeContactScore: Math.round(newEye),
                postureStability: Math.round(newPosture),
                voiceLoudnessScore: micVolume > 15 ? Math.min(98, 80 + Math.round(micVolume * 0.2)) : prev.voiceLoudnessScore,
                fidgetingCount: newFidgetCount,
                blinkRatePerMin: blinkTimestampsRef.current.length > 0 ? Math.round((blinkTimestampsRef.current.length / 12) * 60) : 18,
                distractingHabits: reasons,
                behaviorVerdict: verdict,
                shoulderStatus: currentShoulderStatus,
                shoulderMessage: currentShoulderMessage,
                expressionStatus: currentExprStatus,
                expressionMessage: currentExprMessage
              };
            });

            if (reasons.length > 0) {
              setLiveFidgetWarning(`실시간 코칭: ${reasons.join(' • ')}`);
            } else {
              setLiveFidgetWarning('');
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, micVolume, isCameraOff, interviewerVoice, warningSoundEnabled]);

  // 6. 음성인식 STT 토글
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('브라우저 음성 인식을 지원하지 않습니다. 텍스트로 직접 입력하실 수 있습니다.'));
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
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

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.warn('STT start failed', err);
      setIsRecording(false);
    }
  };

  // 7. 질문 이동
  const handleSelectQuestion = (idx: number) => {
    setCurrentStep(idx + 1);
    setCurrentAnswer(userAnswers[idx + 1] || '');
    if (activeQuestions[idx]) {
      speakLikeInterviewer(activeQuestions[idx].question);
    }
  };

  // 8. 답변 제출 & AI 면접관 심층 평가 및 꼬리 질문 2개 생성
  const handleSubmitAnswer = async () => {
    const q = activeQuestions[currentStep - 1];
    if (!q || !currentAnswer.trim()) {
      alert(t('답변을 먼저 음성이나 텍스트로 입력해 주세요!'));
      return;
    }

    setIsEvaluating(true);
    setUserAnswers(prev => ({ ...prev, [currentStep]: currentAnswer }));
    const capturedBehavior: BehaviorMetrics = { ...realtimeBehavior };

    try {
      const res = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: dedicatedApiKey,
          question: q.question,
          answer: currentAnswer,
          category: q.category,
          behaviorMetrics: capturedBehavior,
          targetCompany: (userProfile?.targetCompanies && userProfile.targetCompanies.length > 0) ? userProfile.targetCompanies[0] : '마이스터/특성화고 추천 기업',
          targetRole: userProfile?.major || '엔지니어링/생산기술'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const followUps = data.followUpQuestions || (data.followUpQuestion ? [data.followUpQuestion] : [
          `그 경험을 통해 궁극적으로 얻은 가장 큰 기술적 역량이나 깨달음은 무엇인가요?`,
          `프로젝트를 진행하면서 친구나 조원과 의견 차이로 다투거나 갈등이 생긴 적은 없었나요?`
        ]);

        setFeedbacks(prev => ({
          ...prev,
          [currentStep]: {
            score: data.score || 88,
            comment: data.comment || '진솔하고 침착한 답변이었습니다.',
            followUpQuestions: followUps,
            goodPoints: data.goodPoints || ['자신감 있는 시선 유지와 당당한 어조', '실제 경험을 바탕으로 한 구체적인 서술'],
            improvePoints: data.improvePoints || ['산만한 손동작을 줄이고 두괄식 문장을 연습해 보세요'],
            behaviorSummary: capturedBehavior
          }
        }));

        // 면접관 아저씨 목소리로 피드백 및 첫 번째 꼬리 질문 음성 낭독
        setTimeout(() => {
          speakLikeInterviewer(`답변 잘 들었습니다. 그렇다면 이어서 한 가지 더 묻겠습니다. ${followUps[0]}`);
        }, 800);
      }
    } catch (err) {
      console.error('Interview evaluation error', err);
      const penaltyItems: string[] = [];
      let baseFallbackScore = 90;
      if (capturedBehavior.eyeContactScore < 70) {
        baseFallbackScore -= 22;
        penaltyItems.push('카메라 시선 불안정(-22점)');
      }
      if (capturedBehavior.postureStability < 70) {
        baseFallbackScore -= 20;
        penaltyItems.push('상체 흔들림(-20점)');
      }
      if (capturedBehavior.fidgetingCount > 0) {
        const p = Math.min(30, capturedBehavior.fidgetingCount * 15 + 10);
        baseFallbackScore -= p;
        penaltyItems.push(`얼굴/손버릇 ${capturedBehavior.fidgetingCount}회(-${p}점)`);
      }
      if (capturedBehavior.blinkRatePerMin > 24) {
        baseFallbackScore -= 14;
        penaltyItems.push('과도한 눈 깜빡임(-14점)');
      }
      const finalFallbackScore = Math.max(38, Math.min(95, baseFallbackScore));

      const defaultFollowUps = [
        `그 경험을 통해 최종적으로 본인이 얻게 된 가장 큰 역량은 무엇이었나요?`,
        `그 과정에서 함께 작업하던 조원과 의견 충돌은 없었습니까? 어떻게 조율했나요?`
      ];
      setFeedbacks(prev => ({
        ...prev,
        [currentStep]: {
          score: finalFallbackScore,
          comment: penaltyItems.length > 0
            ? `⚠️ [실전 태도 감점 경고] ${penaltyItems.join(', ')}으로 인해 점수가 크게 깎였습니다. 실제 채용 면접에서는 산만한 손버릇과 시선 이탈 시 즉시 탈락 또는 치명적 감점이 적용됩니다. 카메라 렌즈를 정면으로 응시하고 손을 무릎 위에 단정히 고정하세요.`
            : t('자신의 전공 지식과 경험을 또박또박 진솔하게 설명하셨습니다. 시선과 자세도 안정적이었습니다.'),
          followUpQuestions: defaultFollowUps,
          goodPoints: [t('실제 경험을 바탕으로 한 구체적인 서술'), t('직무에 대한 진솔한 관심과 노력')],
          improvePoints: penaltyItems.length > 0 ? penaltyItems : [t('손을 얼굴에 대거나 눈을 자주 깜빡이는 습관을 조금 더 의식하고 고치면 완벽합니다.')],
          behaviorSummary: capturedBehavior
        }
      }));

      setTimeout(() => {
        speakLikeInterviewer(`답변 잘 들었습니다. 추가 꼬리 질문을 드리겠습니다. ${defaultFollowUps[0]}`);
      }, 800);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('mystair_interview_ai_key', dedicatedApiKey.trim());
    alert(t('전용 모의면접 AI API 키가 성공적으로 적용되었습니다!'));
    setShowKeySetting(false);
  };

  const currentQ = activeQuestions[currentStep - 1];
  const currentFeedback = feedbacks[currentStep];

  // ==========================================
  // VIEW 1: 면접 시간 선택 초기 화면 (3분 / 5분 / 10분)
  // ==========================================
  if (!selectedDuration) {
    return (
      <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative flex flex-col items-center justify-center p-4 sm:p-8 ${
        isLightMode ? "text-slate-900" : "text-slate-100"
      }`}>
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Sparkles size={15} />
            <span>{t('실전 대기업·공기업 테크니컬 면접')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            {t('AI 모의면접 시간을 선택해 주세요')}
          </h1>

          <p className={`text-sm max-w-md mx-auto leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            {t('원하는 면접 시간을 선택하면 실시간 행동 분석과 대화형 꼬리 질문이 시작됩니다.')}
          </p>

          {/* 3 Course Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 tour-target-interview-courses">
            {/* 3 Minutes Course */}
            <button
              type="button"
              onClick={() => handleSelectCourseCard(3)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-102 hover:shadow-lg relative ${
                candidateDuration === 3
                  ? (isLightMode ? 'bg-indigo-50/70 border-indigo-600 shadow-md' : 'bg-indigo-950/40 border-indigo-500 shadow-md')
                  : (isLightMode ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-slate-900 border-slate-800 hover:border-indigo-400')
              }`}
            >
              {candidateDuration === 3 && (
                <span className="absolute -top-2.5 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {t('선택됨')}
                </span>
              )}
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

            {/* 5 Minutes Course (Recommended) */}
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

            {/* 10 Minutes Course */}
            <button
              type="button"
              onClick={() => handleSelectCourseCard(10)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group hover:scale-102 hover:shadow-lg relative ${
                candidateDuration === 10
                  ? (isLightMode ? 'bg-purple-50/70 border-purple-600 shadow-md' : 'bg-purple-950/40 border-purple-500 shadow-md')
                  : (isLightMode ? 'bg-white border-slate-200 hover:border-purple-300' : 'bg-slate-900 border-slate-800 hover:border-purple-400')
              }`}
            >
              {candidateDuration === 10 && (
                <span className="absolute -top-2.5 bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {t('선택됨')}
                </span>
              )}
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

          {/* 명시적인 시작 버튼 */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => handleStartInterview(candidateDuration)}
              className="w-full sm:w-80 py-4 px-8 rounded-2xl font-black text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 tour-target-interview-start-btn"
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

  // 실시간 예상 종합 면접 점수 (100점 만점 기준 수치 확확 깎여서 위기감 극대화)
  const currentLiveScore = Math.max(25, Math.min(98, Math.round(
    (realtimeBehavior.eyeContactScore * 0.35) + 
    (realtimeBehavior.postureStability * 0.35) + 
    (realtimeBehavior.voiceLoudnessScore * 0.30) - 
    (realtimeBehavior.fidgetingCount * 24) - 
    (realtimeBehavior.blinkRatePerMin > 24 ? 16 : 0)
  )));

  const dangerGrade = currentLiveScore >= 88 ? 'A' : currentLiveScore >= 75 ? 'B' : currentLiveScore >= 65 ? 'C' : 'D';
  const hasActivePenalty = realtimeBehavior.eyeContactScore < 70 || realtimeBehavior.postureStability < 70 || realtimeBehavior.fidgetingCount > 0 || realtimeBehavior.blinkRatePerMin > 24;

  // ==========================================
  // VIEW 2: 실시간 AI 모의면접 진행 룸
  // ==========================================
  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
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
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* AI 남성 면접관 음성 선택 및 미리듣기 */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all bg-indigo-50/70 dark:bg-slate-800 border-indigo-200/80 dark:border-slate-700">
            <Volume2 size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <select
              value={interviewerVoice}
              onChange={e => setInterviewerVoice(e.target.value as 'injoon' | 'bongjin')}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-indigo-950 dark:text-indigo-200"
              title="실제 사람 같은 한국인 남성 면접관 음성 선택"
            >
              <option value="injoon">🎙️ 이인준 (40대 자연스러운 남성)</option>
              <option value="bongjin">🎙️ 신봉진 (50대 묵직한 베테랑 남성)</option>
            </select>
            <button
              type="button"
              onClick={() => speakLikeInterviewer("반갑습니다. 지원자의 역량과 포부를 실제 면접처럼 진솔하게 말씀해 주세요.")}
              className="px-2 py-0.5 rounded text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shrink-0 font-medium"
              title="선택한 남성 면접관 음성 미리듣기 테스트"
            >
              미리듣기
            </button>
          </div>

          {/* 경고 비프음 ON/OFF 토글 */}
          <button
            type="button"
            onClick={() => setWarningSoundEnabled(!warningSoundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              warningSoundEnabled
                ? (isLightMode ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-amber-950/40 border-amber-800 text-amber-300')
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')
            }`}
            title={warningSoundEnabled ? "태도 감점 비상 경고음 켜짐" : "비상 경고음 꺼짐"}
          >
            {warningSoundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="hidden xl:inline">{warningSoundEnabled ? '경고음 ON' : '경고음 OFF'}</span>
          </button>

          {/* Live Remaining Timer */}
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
            onClick={() => setSelectedDuration(null)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="코스 시간 다시 고르기"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={() => setShowKeySetting(!showKeySetting)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showKeySetting 
                ? 'bg-amber-500 text-white border-amber-600' 
                : (isLightMode ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/40 border-amber-800 text-amber-300')
            }`}
          >
            <Key size={14} />
            <span className="hidden sm:inline">{t('전용 키')}</span>
          </button>

          {/* 마이크 음소거 토글 버튼 */}
          <button
            type="button"
            onClick={toggleMicMute}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMicMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700')
            }`}
            title={isMicMuted ? "마이크 켜기" : "내 마이크 음소거"}
          >
            {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="hidden md:inline">{isMicMuted ? t('마이크 꺼짐') : t('마이크 ON')}</span>
          </button>

          {/* 카메라 끄기/켜기 토글 버튼 */}
          <button
            type="button"
            onClick={toggleCameraOff}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isCameraOff
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700')
            }`}
            title={isCameraOff ? "카메라 켜기" : "내 카메라 끄기"}
          >
            {isCameraOff ? <CameraOff size={16} /> : <Camera size={16} />}
            <span className="hidden md:inline">{isCameraOff ? t('카메라 꺼짐') : t('카메라 ON')}</span>
          </button>

          <button
            type="button"
            onClick={() => setVoiceGuideEnabled(!voiceGuideEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              voiceGuideEnabled
                ? (isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300')
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400')
            }`}
            title={voiceGuideEnabled ? "면접관 음성 켜짐" : "면접관 음성 꺼짐"}
          >
            {voiceGuideEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden lg:inline">{voiceGuideEnabled ? '면접관 음성 ON' : '음소거'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20">
        
        {/* Dedicated API Key Setting Banner */}
        {showKeySetting && (
          <div className={`p-4 rounded-2xl border mb-6 transition-all ${
            isLightMode ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-950/40 border-amber-800/60'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">
              <Key size={16} />
              <span>{t('행동 분석 및 대화형 면접 전용 AI API 키')}</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
              {t('입력하신 전용 키를 바탕으로 목소리 성량, 시선, 손버릇, 거슬리는 습관과 실시간 꼬리 질문을 심층 연동합니다.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={dedicatedApiKey}
                onChange={e => setDedicatedApiKey(e.target.value)}
                placeholder="ogqc_..."
                className={`w-full sm:flex-1 px-3.5 py-2 rounded-xl text-xs font-mono border outline-none ${
                  isLightMode ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-900 border-amber-700 text-white'
                }`}
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shrink-0"
              >
                {t('키 저장 및 적용')}
              </button>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-medium">
            ⚠️ {cameraError}
          </div>
        )}

        {/* 2-Column Split: Prominent Camera & Live Coaching HUD (7 Cols) / Interviewer Dialogue (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Enlarged Camera + Live Feedback Console (7 Cols) */}
          <div className={`${isCameraExpanded ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4 tour-target-interview-camera-hud transition-all`}>
            
            {/* Top Bar above Camera: Status & View Size Toggle */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{cameraActive && !isCameraOff ? t('실시간 모의면접 카메라 연결됨') : t('카메라 대기')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraExpanded(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isCameraExpanded 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : (isLightMode ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200')
                }`}
                title={isCameraExpanded ? "기본 2분할 화면으로 축소" : "내 화면 넓게 확대 보기"}
              >
                {isCameraExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isCameraExpanded ? t('분할 보기') : t('화면 크게 보기')}</span>
              </button>
            </div>

            {/* Enlarged Webcam Video Box (No flickering, no pulsing, no foggy blur) */}
            <div className={`relative rounded-3xl overflow-hidden border shadow-xl w-full aspect-[16/10] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[500px] flex items-center justify-center transition-all bg-slate-950 ${
              isLightMode ? 'border-slate-200/90 shadow-slate-200/50' : 'border-slate-800 shadow-black/40'
            }`}>
              {/* Actual Video Feed - 100% crisp, no CSS filters or pulse */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transform -scale-x-100 ${(!cameraActive || isCameraOff) ? 'hidden' : 'block'}`}
              />

              {(!cameraActive || isCameraOff) && (
                <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mb-4">
                    <CameraOff size={32} className="text-slate-400" />
                  </div>
                  <p className="text-base font-bold text-slate-200 mb-1">
                    {isCameraOff ? t('사용자에 의해 카메라가 꺼졌습니다') : t('카메라가 꺼져 있습니다')}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mb-4">
                    {t('실제 면접장처럼 내 얼굴과 어깨, 시선을 확인하며 답변을 연습해 보세요.')}
                  </p>
                  <button
                    type="button"
                    onClick={isCameraOff ? toggleCameraOff : startCamera}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer flex items-center gap-2 shadow-md transition-colors"
                  >
                    <Camera size={16} />
                    <span>{t('카메라 켜기')}</span>
                  </button>
                </div>
              )}

              {/* Clean Camera Overlays (Unobtrusive & Elegant) */}
              {cameraActive && !isCameraOff && (
                <>
                  {/* Subtle Viewfinder Frame Corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40 pointer-events-none rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40 pointer-events-none rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40 pointer-events-none rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40 pointer-events-none rounded-br-lg" />

                  {/* AI Interviewer Speaking Indicator */}
                  {isInterviewerSpeaking && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-indigo-300 shadow-md">
                      <Volume2 size={14} className="text-white" />
                      <span>남성 면접관 발화 중</span>
                      <span className="flex gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0ms]"></span>
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:150ms]"></span>
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:300ms]"></span>
                      </span>
                    </div>
                  )}

                  {/* Live Status Pill at Bottom Left of Camera */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>HD 실시간 분석 중</span>
                  </div>
                </>
              )}
            </div>

            {/* 📍 화면 바로 밑 실시간 피드백 모니터링 영역 (Real-time Live Coaching Console Directly Under Video) */}
            <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              isLightMode ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/95 border-slate-800 shadow-lg'
            }`}>
              
              {/* Header: Title & Real-time Live Score */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity size={17} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    {t('실시간 자세 & 태도 피드백')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">태도 진단:</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    currentLiveScore >= 80 
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                      : currentLiveScore >= 65
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {currentLiveScore}점 / 100점
                  </span>
                </div>
              </div>

              {/* 4대 정밀 모니터링 카드: 어깨 수평 | 눈 깜빡임 | 이상한 습관 | 표정 분석 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
                
                {/* 1. 어깨 수평 (Shoulder Balance) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  realtimeBehavior.shoulderStatus === 'level'
                    ? (isLightMode ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-950/20 border-emerald-900/40')
                    : (isLightMode ? 'bg-amber-50/60 border-amber-200/70' : 'bg-amber-950/20 border-amber-900/40')
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Scale size={13} className={realtimeBehavior.shoulderStatus === 'level' ? 'text-emerald-500' : 'text-amber-500'} />
                      어깨 수평
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      realtimeBehavior.shoulderStatus === 'level'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {realtimeBehavior.shoulderStatus === 'level' ? '수평 양호' : '기울어짐'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                    {realtimeBehavior.shoulderMessage}
                  </p>
                </div>

                {/* 2. 눈 깜빡임 (Eye Blinking) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  realtimeBehavior.blinkRatePerMin <= 24
                    ? (isLightMode ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-950/20 border-emerald-900/40')
                    : (isLightMode ? 'bg-amber-50/60 border-amber-200/70' : 'bg-amber-950/20 border-amber-900/40')
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Eye size={13} className={realtimeBehavior.blinkRatePerMin <= 24 ? 'text-emerald-500' : 'text-amber-500'} />
                      눈 깜빡임
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      realtimeBehavior.blinkRatePerMin <= 24
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {realtimeBehavior.blinkRatePerMin}회/분
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                    {realtimeBehavior.blinkRatePerMin > 24 
                      ? '긴장으로 잦은 깜빡임 (심호흡)' 
                      : '자연스럽고 편안한 깜빡임'}
                  </p>
                </div>

                {/* 3. 이상한 습관 (Distracting Habits / Face Touching) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  realtimeBehavior.fidgetingCount === 0
                    ? (isLightMode ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-950/20 border-emerald-900/40')
                    : (isLightMode ? 'bg-amber-50/60 border-amber-200/70' : 'bg-amber-950/20 border-amber-900/40')
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Sparkles size={13} className={realtimeBehavior.fidgetingCount === 0 ? 'text-emerald-500' : 'text-amber-500'} />
                      손버릇/습관
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      realtimeBehavior.fidgetingCount === 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {realtimeBehavior.fidgetingCount === 0 ? '단정함' : `${realtimeBehavior.fidgetingCount}회 주의`}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                    {realtimeBehavior.fidgetingCount === 0 
                      ? '손이 무릎 위에 단정하게 놓임' 
                      : '얼굴/턱 만짐 주의 (손 무릎에 두기)'}
                  </p>
                </div>

                {/* 4. 표정 분석 (Facial Expression) */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  realtimeBehavior.expressionStatus === 'good'
                    ? (isLightMode ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-950/20 border-emerald-900/40')
                    : realtimeBehavior.expressionStatus === 'neutral'
                      ? (isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700')
                      : (isLightMode ? 'bg-amber-50/60 border-amber-200/70' : 'bg-amber-950/20 border-amber-900/40')
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Smile size={13} className={realtimeBehavior.expressionStatus === 'good' ? 'text-emerald-500' : 'text-indigo-500'} />
                      표정 분석
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      realtimeBehavior.expressionStatus === 'good'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : realtimeBehavior.expressionStatus === 'neutral'
                          ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {realtimeBehavior.expressionStatus === 'good' ? '밝은 미소' : realtimeBehavior.expressionStatus === 'neutral' ? '차분함' : '경직됨'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                    {realtimeBehavior.expressionMessage}
                  </p>
                </div>
              </div>

              {/* 실시간 한 줄 코칭 피드백 바 (Under Screen Real-Time Coaching Ticker) */}
              <div className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium border ${
                isLightMode ? 'bg-indigo-50/70 border-indigo-100 text-indigo-900' : 'bg-indigo-950/30 border-indigo-900/40 text-indigo-200'
              }`}>
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold">
                  💡
                </span>
                <span className="flex-1 leading-relaxed">
                  <strong className="font-bold mr-1">{t('실시간 코칭')}:</strong>
                  {realtimeBehavior.distractingHabits.length > 0 
                    ? `${realtimeBehavior.distractingHabits[0]}에 유의하세요. ${realtimeBehavior.shoulderStatus !== 'level' ? realtimeBehavior.shoulderMessage : ''}` 
                    : realtimeBehavior.expressionStatus === 'good'
                      ? '자연스러운 미소와 바른 어깨 수평을 훌륭하게 유지하고 있습니다. 이 자세를 유지하며 답변하세요.'
                      : '어깨 수평과 시선이 안정적입니다. 답변할 때 입꼬리를 살짝 올려 호감형 인상을 보여주세요.'}
                </span>
              </div>

              {/* 보조 지표: 카메라 시선 및 목소리 성량 바 */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* 시선 정면 유지도 */}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Eye size={13} /> 카메라 시선</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{realtimeBehavior.eyeContactScore}%</span>
                </div>
                {/* 자세 안정도 */}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> 자세 안정도</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{realtimeBehavior.postureStability}%</span>
                </div>
                {/* 목소리 크기 */}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Volume1 size={13} /> 목소리 성량</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{micVolume > 10 ? `${micVolume}%` : '대기 중'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interviewer Interaction & Follow-up Dialogue (5 Cols or Full width when expanded) */}
          <div className={`${isCameraExpanded ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-5 transition-all`}>
            
            {/* Question Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeQuestions.map((q, idx) => {
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

            {/* Current Question & Dialogue Card */}
            {currentQ && (
              <div className={`p-5 rounded-2xl border transition-all tour-target-interview-qa ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {t('면접 질문')} {currentStep} / {activeQuestions.length} • {currentQ.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {isInterviewerSpeaking && (
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 animate-pulse">
                        <Volume2 size={13} /> {t('면접관 발화 중...')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => speakLikeInterviewer(currentQ.question)}
                      className={`text-xs flex items-center gap-1 font-semibold cursor-pointer transition-colors px-2.5 py-1 rounded-lg border ${
                        isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-indigo-950/50 border-indigo-800 text-indigo-300 hover:bg-indigo-900/60'
                      }`}
                    >
                      <Volume2 size={14} />
                      <span>{t('면접관 음성 다시 듣기')}</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-bold leading-snug mb-3">
                  "{currentQ.question}"
                </h2>

                <div className={`p-3 rounded-xl text-xs mb-4 border ${
                  isLightMode ? 'bg-amber-50/70 border-amber-200/80 text-amber-900' : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}>
                  <span className="font-bold">🎯 {t('답변 핵심 가이드')}:</span> {currentQ.hint}
                </div>

                {/* User Answer Textarea with Mic Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{t('나의 면접 답변 (실제 말하듯이 답변)')}:</span>
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
                    placeholder={t('마이크를 켜고 실제 면접처럼 말씀하시거나, 여기에 답변을 작성하세요.')}
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none resize-none transition-colors ${
                      isLightMode 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500' 
                        : 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Submit Action */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Zap size={14} className="text-amber-500" />
                    <span>{t('목소리 성량과 시선, 손버릇 데이터가 AI 면접관에게 함께 전달됩니다.')}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || !currentAnswer.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer tour-target-interview-submit"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles size={16} className="animate-spin" />
                        <span>{t('AI 면접관 평가 분석 중...')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{t('AI 면접관에게 답변 제출')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Feedback Report & Interactive Follow-up Questions Card */}
                {currentFeedback && (
                  <div className={`mt-5 p-4 rounded-xl border animate-in fade-in duration-300 ${
                    isLightMode ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/30 border-indigo-900/40'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Award size={18} />
                        {t('AI 면접관 실시간 총평')}
                      </span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full text-white ${
                        currentFeedback.score < 65 ? 'bg-red-600 animate-pulse' : currentFeedback.score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        {currentFeedback.score}점 / 100점 ({currentFeedback.score < 65 ? '🚨 D등급 탈락 위기' : currentFeedback.score < 75 ? 'C등급 감점 주의' : currentFeedback.score < 85 ? 'B등급 보통' : 'A등급 합격 안정권'})
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium leading-relaxed mb-3">
                      {currentFeedback.comment}
                    </p>

                    {/* Behavior Snapshot at the time of answer */}
                    <div className={`p-3 rounded-lg border mb-3 text-xs ${
                      isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                    }`}>
                      <span className="font-bold text-indigo-500 block mb-1">📊 {t('답변 당시 태도 및 거슬리는 행동 분석 결과')}:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-500">
                        <div>시선 유지도: <b className={currentFeedback.behaviorSummary.eyeContactScore < 70 ? "text-amber-500 font-bold" : "text-indigo-600"}>{currentFeedback.behaviorSummary.eyeContactScore}%</b></div>
                        <div>어깨 수평: <b className={currentFeedback.behaviorSummary.shoulderStatus !== 'level' ? "text-amber-500 font-bold" : "text-emerald-600"}>{currentFeedback.behaviorSummary.shoulderStatus === 'level' ? '수평 양호' : '기울어짐 주의'}</b></div>
                        <div>자세 안정도: <b className={currentFeedback.behaviorSummary.postureStability < 70 ? "text-amber-500 font-bold" : "text-emerald-600"}>{currentFeedback.behaviorSummary.postureStability}%</b></div>
                        <div>손버릇/습관: <b className={currentFeedback.behaviorSummary.fidgetingCount > 0 ? "text-amber-500 font-bold" : "text-emerald-600"}>{currentFeedback.behaviorSummary.fidgetingCount}회</b></div>
                        <div>눈 깜빡임: <b className={currentFeedback.behaviorSummary.blinkRatePerMin > 24 ? "text-amber-500 font-bold" : "text-emerald-600"}>{currentFeedback.behaviorSummary.blinkRatePerMin}회/분</b></div>
                        <div>표정 분석: <b className={currentFeedback.behaviorSummary.expressionStatus === 'good' ? "text-emerald-600 font-bold" : currentFeedback.behaviorSummary.expressionStatus === 'neutral' ? "text-slate-600" : "text-amber-500"}>{currentFeedback.behaviorSummary.expressionStatus === 'good' ? '밝은 미소' : currentFeedback.behaviorSummary.expressionStatus === 'neutral' ? '차분함' : '경직됨'}</b></div>
                      </div>
                    </div>

                    {/* Good & Improve Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
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
                        <span className="font-bold block mb-1">💡 {t('보완할 점 (자세 & 내용)')}:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {currentFeedback.improvePoints.map((ip, i) => (
                            <li key={i}>{ip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Multiple Follow-up Questions Section (꼬리질문 1~2개 실시간 연계) */}
                    {currentFeedback.followUpQuestions && currentFeedback.followUpQuestions.length > 0 && (
                      <div className={`p-4 rounded-xl border space-y-3 ${
                        isLightMode ? 'bg-purple-50/80 border-purple-200 text-purple-950' : 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                            <MessageSquare size={14} />
                            {t('AI 면접관의 실시간 꼬리 질문 (대화형 연계)')}
                          </span>
                          <span className="text-[10px] text-purple-600 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full font-bold">
                            {currentFeedback.followUpQuestions.length}개 질문
                          </span>
                        </div>

                        {currentFeedback.followUpQuestions.map((fq, idx) => (
                          <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 ${
                            isLightMode ? 'bg-white border-purple-100' : 'bg-slate-900 border-purple-900'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                                <span className="text-purple-600 font-bold mr-1">꼬리 Q{idx + 1}.</span> "{fq}"
                              </p>
                              <button
                                type="button"
                                onClick={() => speakLikeInterviewer(fq)}
                                className="text-xs text-purple-600 hover:text-purple-800 shrink-0 cursor-pointer p-1"
                                title="꼬리 질문 음성 듣기"
                              >
                                <Volume2 size={16} />
                              </button>
                            </div>

                            {activeFollowUpIdx === idx ? (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <textarea
                                  rows={2}
                                  value={followUpAnswer}
                                  onChange={e => setFollowUpAnswer(e.target.value)}
                                  placeholder="꼬리 질문에 대한 추가 답변을 말씀하시거나 작성해 보세요..."
                                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                                    isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                                  }`}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setActiveFollowUpIdx(null)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 cursor-pointer"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(t('꼬리 질문 답변이 잘 전달되었습니다! 훌륭한 대화형 실전 연습이었습니다.'));
                                      setActiveFollowUpIdx(null);
                                      setFollowUpAnswer('');
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                                  >
                                    답변 완료
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveFollowUpIdx(idx)}
                                className="self-start text-[11px] font-bold text-purple-600 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>이 꼬리 질문에 바로 대답하기</span> →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
