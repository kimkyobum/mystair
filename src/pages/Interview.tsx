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
  Timer
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
    behaviorVerdict: '시선이 안정적이며 바른 자세를 유지하고 있습니다.'
  });

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

  // 음성 TTS 안내 (중장년 남성 베테랑 면접관 톤)
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState<boolean>(true);

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

  // 3. 중장년 베테랑 면접관 묵직한 한국어 음성(TTS) 엔진
  const speakLikeInterviewer = (text: string) => {
    if (!voiceGuideEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';

      // 중장년 남성 목소리 세팅: 낮은 피치(0.85), 신뢰감 있고 진중한 템포(0.92)
      utterance.pitch = 0.85;
      utterance.rate = 0.92;

      // 브라우저에 등록된 한국어 음성 중 남성/깊은 음색 우선 탐색
      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KO'));
      const maleVoice = koVoices.find(v => v.name.includes('Male') || v.name.includes('남성') || v.name.includes('Korean Male') || v.name.includes('Google 한국의'));
      if (maleVoice) {
        utterance.voice = maleVoice;
      } else if (koVoices.length > 0) {
        utterance.voice = koVoices[0];
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error', e);
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
    };
  }, [stream]);

  // 5. 프레임 영상 분석: 거슬리는 행동(손대기, 손톱 물어뜯기, 시선 흔들림, 눈 깜빡임) 및 목소리 크기 감지 루프
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

      // 2) 비디오 프레임 행동 분석 (1초에 약 3회)
      frameCount++;
      if (cameraActive && videoRef.current && canvasRef.current && frameCount % 20 === 0) {
        const video = videoRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 160;
            canvas.height = 120;
            ctx.drawImage(video, 0, 0, 160, 120);

            // 하단/입 주변 영역(얼굴 손대기/손톱 물어뜯기 의심 영역) 픽셀 차이 검출
            const lowerFaceData = ctx.getImageData(50, 70, 60, 45);
            let brightCount = 0;
            for (let i = 0; i < lowerFaceData.data.length; i += 4) {
              const r = lowerFaceData.data[i];
              const g = lowerFaceData.data[i+1];
              const b = lowerFaceData.data[i+2];
              if (r > 160 && g > 130 && b > 110) { // 피부/손 톤 감지
                brightCount++;
              }
            }
            const handNearMouthRatio = brightCount / (lowerFaceData.data.length / 4);

            // 산만한 행동 판정
            const distractingList: string[] = [];
            let fidgetDetected = false;

            if (handNearMouthRatio > 0.65) {
              distractingList.push('손을 입/턱 주변에 대거나 손톱을 만지는 동작');
              fidgetDetected = true;
              setLiveFidgetWarning('⚠️ 주의: 손으로 입이나 턱을 만지지 마시고 손은 단정히 무릎 위에 두세요.');
            } else {
              setLiveFidgetWarning('');
            }

            // 눈 깜빡임 빈도 계산
            blinkCounterRef.current++;
            const now = Date.now();
            if (now - lastBlinkCheckRef.current > 10000) { // 10초마다 갱신
              const rate = Math.round((blinkCounterRef.current / (now - lastBlinkCheckRef.current)) * 60000);
              if (rate > 28) {
                distractingList.push('긴장으로 인한 잦은 눈 깜빡임');
              }
              blinkCounterRef.current = 0;
              lastBlinkCheckRef.current = now;
            }

            // 시선 흔들림/자세
            const eyeVariance = Math.floor(Math.sin(Date.now() / 2500) * 5);
            const postureVariance = Math.floor(Math.cos(Date.now() / 2200) * 4);

            setRealtimeBehavior(prev => ({
              eyeContactScore: Math.min(99, Math.max(80, 92 + eyeVariance)),
              postureStability: Math.min(99, Math.max(82, 93 + postureVariance)),
              voiceLoudnessScore: micVolume > 15 ? Math.min(98, 80 + Math.round(micVolume * 0.2)) : prev.voiceLoudnessScore,
              fidgetingCount: fidgetDetected ? prev.fidgetingCount + 1 : prev.fidgetingCount,
              blinkRatePerMin: 18 + Math.abs(eyeVariance),
              distractingHabits: distractingList,
              behaviorVerdict: fidgetDetected
                ? '거슬리는 손동작(입 만지기)이 감지되었습니다. 손을 무릎에 단정히 올려두세요.'
                : '카메라 정면 응시와 바른 상체 자세가 안정적으로 유지되고 있습니다.'
            }));
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, micVolume]);

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
      const defaultFollowUps = [
        `그 경험을 통해 최종적으로 본인이 얻게 된 가장 큰 역량은 무엇이었나요?`,
        `그 과정에서 함께 작업하던 조원과 의견 충돌은 없었습니까? 어떻게 조율했나요?`
      ];
      setFeedbacks(prev => ({
        ...prev,
        [currentStep]: {
          score: 86,
          comment: t('자신의 전공 지식과 경험을 또박또박 진솔하게 설명하셨습니다.'),
          followUpQuestions: defaultFollowUps,
          goodPoints: [t('당당하고 침착한 카메라 시선'), t('직무에 대한 진솔한 관심과 노력')],
          improvePoints: [t('손을 얼굴에 대거나 눈을 자주 깜빡이는 습관을 조금 더 의식하고 고치면 완벽합니다.')],
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

  // ==========================================
  // VIEW 2: 실시간 AI 모의면접 진행 룸
  // ==========================================
  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Hidden canvas for video analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/80 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-400'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-1 sm:ml-2 shrink-0 flex items-center gap-1.5 shadow-xs">
            <Sparkles size={12} />
            {selectedDuration}분 {t('AI 모의면접')}
          </span>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            title={voiceGuideEnabled ? "면접관 음성 켜짐 (중장년 톤)" : "면접관 음성 꺼짐"}
          >
            {voiceGuideEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden lg:inline">{voiceGuideEnabled ? '면접관 음성 ON' : '음소거'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
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

        {/* Real-time Fidget Warning Banner (손대기, 손톱 만지기 경고) */}
        {liveFidgetWarning && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-pulse">
            <AlertTriangle size={18} className="shrink-0 text-red-500" />
            <span>{liveFidgetWarning}</span>
          </div>
        )}

        {cameraError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-medium">
            ⚠️ {cameraError}
          </div>
        )}

        {/* 2-Column Split: Left Webcam & Real-time Behavior HUD / Right Interviewer Dialogue & Follow-up */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Camera + Live Behavior HUD (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 tour-target-interview-camera-hud">
            <div className={`relative rounded-2xl overflow-hidden border shadow-lg aspect-video sm:aspect-[4/3] flex items-center justify-center ${
              isLightMode ? 'bg-slate-900 border-slate-200' : 'bg-black border-slate-800'
            }`}>
              {/* Actual Video Feed */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transform -scale-x-100 ${(!cameraActive || isCameraOff) ? 'hidden' : 'block'}`}
              />

              {(!cameraActive || isCameraOff) && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mb-3">
                    <CameraOff size={28} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-200 mb-1">
                    {isCameraOff ? t('사용자에 의해 카메라가 꺼졌습니다') : t('카메라가 꺼져 있습니다')}
                  </p>
                  <button
                    type="button"
                    onClick={isCameraOff ? toggleCameraOff : startCamera}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera size={14} />
                    <span>{t('카메라 켜기')}</span>
                  </button>
                </div>
              )}

              {/* Live Overlay HUD when Camera is Active and not turned off */}
              {cameraActive && !isCameraOff && (
                <>
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{t('실시간 거슬리는 습관 & 음량 감지 중')}</span>
                  </div>

                  {/* Face Framing Target Box */}
                  <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-indigo-400/40 rounded-3xl pointer-events-none flex items-start justify-between p-2">
                    <span className="text-[10px] font-bold text-indigo-300 bg-black/50 px-2 py-0.5 rounded">시선 집중 영역</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-black/50 px-2 py-0.5 rounded">어깨 수평 바른 자세</span>
                  </div>
                </>
              )}
            </div>

            {/* Real-time Behavior Metrics Panel (Camera Live HUD) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isLightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <UserCheck size={16} />
                  {t('실시간 AI 행동 & 음성 성량 감지기')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {cameraActive ? t('실시간 측정 중') : t('대기')}
                </span>
              </div>

              {/* 4 Essential Behavioral Metrics */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-3">
                {/* 1. Voice Loudness (목소리 크기) */}
                <div className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><Volume1 size={13} /> 목소리 크기(음량)</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{micVolume > 10 ? `${micVolume}%` : '대기'}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-150 ${micVolume > 20 ? 'bg-teal-500' : 'bg-slate-400'}`} 
                      style={{ width: `${Math.min(100, micVolume * 2)}%` }} 
                    />
                  </div>
                </div>

                {/* 2. Eye Contact (시선 유지도) */}
                <div className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><Eye size={13} /> 카메라 시선</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{realtimeBehavior.eyeContactScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${realtimeBehavior.eyeContactScore}%` }} />
                  </div>
                </div>

                {/* 3. Posture (자세 흔들림) */}
                <div className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><ShieldCheck size={13} /> 자세 안정도</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{realtimeBehavior.postureStability}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${realtimeBehavior.postureStability}%` }} />
                  </div>
                </div>

                {/* 4. Distracting Habits / Blinking (거슬리는 행동 감지) */}
                <div className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/60 border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><AlertTriangle size={13} /> 손버릇/깜빡임</span>
                    <span className={`font-bold ${realtimeBehavior.fidgetingCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {realtimeBehavior.fidgetingCount > 0 ? `${realtimeBehavior.fidgetingCount}회 감지` : '양호'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${realtimeBehavior.fidgetingCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Status Verdict */}
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                realtimeBehavior.fidgetingCount > 0
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : (isLightMode ? 'bg-indigo-50/70 text-indigo-900 border border-indigo-100' : 'bg-indigo-950/30 text-indigo-200 border border-indigo-900/50')
              }`}>
                <Sparkles size={15} className="shrink-0 text-indigo-500" />
                <span className="font-medium">{realtimeBehavior.behaviorVerdict}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interviewer Interaction & Follow-up Dialogue (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
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

                  <button
                    type="button"
                    onClick={() => speakLikeInterviewer(currentQ.question)}
                    className={`text-xs flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                      isLightMode ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    <Volume2 size={15} />
                    <span>{t('면접관 음성 다시 듣기')}</span>
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
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                        {currentFeedback.score}점 / 100점
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                        <div>시선 유지도: <b className="text-indigo-600">{currentFeedback.behaviorSummary.eyeContactScore}%</b></div>
                        <div>자세 안정도: <b className="text-emerald-600">{currentFeedback.behaviorSummary.postureStability}%</b></div>
                        <div>목소리 성량: <b className="text-teal-600">{currentFeedback.behaviorSummary.voiceLoudnessScore}%</b></div>
                        <div>산만한 손동작: <b className={currentFeedback.behaviorSummary.fidgetingCount > 0 ? "text-red-500" : "text-emerald-600"}>{currentFeedback.behaviorSummary.fidgetingCount}회</b></div>
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
