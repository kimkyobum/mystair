import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlienUFOSvg } from './FloatingAliens';
import { useTheme } from '../context/ThemeContext';
import { 
  isTourAllowedForCurrentAccount, 
  markTourCompletedForCurrentAccount,
  getEffectiveAccountKey 
} from '../utils/tourTracker';

export interface TourStep {
  id: string;
  target: string;
  message: string;
  action: 'click_target' | 'click_anywhere';
  onNext?: (navigate: any) => void;
  allowAnywhereClick?: boolean;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    let i = 0;
    // Strip markdown formatting characters to count raw text length
    const rawTextLength = text.replace(/\*\*/g, '').length;
    const interval = setInterval(() => {
      setDisplayedLength((prev) => prev + 1);
      i++;
      if (i >= rawTextLength) clearInterval(interval);
    }, 35); // Fast typing speed
    return () => clearInterval(interval);
  }, [text]);

  const parts = text.split(/(\*\*.*?\*\*)/g);
  let charIndex = 0;

  return (
    <span className="whitespace-pre-wrap" style={{ wordBreak: 'keep-all' }}>
      {parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <strong key={partIndex} className="text-teal-400 font-extrabold">
              {content.split('').map((char, i) => {
                const isVisible = charIndex < displayedLength;
                charIndex++;
                return <span key={i} className={isVisible ? '' : 'opacity-0'}>{char}</span>;
              })}
            </strong>
          );
        } else {
          return (
            <span key={partIndex}>
              {part.split('').map((char, i) => {
                const isVisible = charIndex < displayedLength;
                charIndex++;
                return <span key={i} className={isVisible ? '' : 'opacity-0'}>{char}</span>;
              })}
            </span>
          );
        }
      })}
    </span>
  );
};

// Exact sequence requested:
// 1. 마이페이지 (기본 정보 학적)
// 2. 수정하기
// 3. 진로작성진단
// 4. MBTI
// 5. 홀랜드
// 6. 희망목표기업
// 7. 환경설정에서 검은배경할지 화이트 배경할지
// 8. 나만의 기업찾기
// 9. 자격증가이드
// 10. 성적다이어리
// 11. 자기소개서작성
// 12. 모의 면접
// 13. MYSTAIR
// 14. 마지막 마무리
const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    target: 'body',
    message: '가이드를 시작할까요?',
    action: 'click_anywhere',
  },
  {
    id: 'step-nav-mypage',
    target: '.tour-target-nav-mypage-desktop, .tour-target-nav-mypage-mobile',
    message: '**마이페이지**에서 기본 정보를 관리해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/mypage'),
  },
  {
    id: 'step-basic-info',
    target: '.tour-target-profile-academic, .tour-target-tab-profile',
    message: '**기본 정보**에서 학교와 전공을 확인해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      const el = document.querySelector('.tour-target-tab-profile') as HTMLElement;
      if (el) el.click();
    }
  },
  {
    id: 'step-edit-profile',
    target: '.tour-target-edit-mode',
    message: '**수정하기**로 프로필을 등록·변경해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-aptitude-tab',
    target: '.tour-target-tab-aptitude',
    message: '**진로 적성 진단**에서 적성 검사를 진행해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      const el = document.querySelector('.tour-target-tab-aptitude') as HTMLElement;
      if (el) el.click();
    }
  },
  {
    id: 'step-mbti',
    target: '.tour-target-profile-mbti',
    message: '**MBTI**로 추천 직무를 진단해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-holland',
    target: '.tour-target-profile-holland',
    message: '**홀랜드**로 맞춤 산업군을 확인해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-companies-tab',
    target: '.tour-target-tab-companies',
    message: '**희망 기업**을 등록하고 관리해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      const el = document.querySelector('.tour-target-tab-companies') as HTMLElement;
      if (el) el.click();
    }
  },
  {
    id: 'step-settings-theme',
    target: '.tour-target-settings-theme, .tour-target-tab-settings',
    message: '**환경 설정**에서 다크/라이트 테마를 변경해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/company-search'),
  },
  {
    id: 'step-nav-company',
    target: '.tour-target-nav-company',
    message: '**나만의 기업찾기**로 맞춤 기업을 탐색해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/certificates'),
  },
  {
    id: 'step-nav-cert',
    target: '.tour-target-nav-cert',
    message: '**자격증 가이드**로 필수 자격증을 확인해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/diary'),
  },
  {
    id: 'step-diary-open',
    target: '.tour-target-diary-write-btn, .tour-target-diary-today',
    message: '**일기 쓰기**를 눌러 작성 창을 열어요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      window.dispatchEvent(new CustomEvent('tour-open-diary'));
    }
  },
  {
    id: 'step-diary-title',
    target: '.tour-target-diary-title',
    message: '**제목**을 입력해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-diary-mood',
    target: '.tour-target-diary-mood',
    message: '**오늘의 기분**을 선택해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-diary-content',
    target: '.tour-target-diary-content',
    message: '**실습·성장 내용**을 자유롭게 기록해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      window.dispatchEvent(new CustomEvent('tour-close-diary'));
    }
  },
  {
    id: 'step-diary-summary',
    target: '.tour-target-resume-summary',
    message: '**자소서 요약**으로 기록을 자동 정리해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/cover-letter'),
  },
  {
    id: 'step-coverletter-company',
    target: '.tour-target-cover-companies',
    message: '**목표 기업** 전용 자소서를 작성해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-coverletter-myexp',
    target: '.tour-target-cover-my-exp',
    message: '**내 경험**을 불러와 자소서에 활용해요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/interview'),
  },
  {
    id: 'step-interview-course',
    target: '.tour-target-interview-courses',
    message: '**면접 코스** 시간을 선택해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-interview-start',
    target: '.tour-target-interview-start-btn',
    message: '**면접 시작하기**를 눌러 면접실로 들어가요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      window.dispatchEvent(new CustomEvent('tour-enter-interview'));
    }
  },
  {
    id: 'step-interview-camera-hud',
    target: '.tour-target-interview-camera-hud',
    message: '**카메라·AI**가 시선, 성량, 자세를 분석해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-interview-qa',
    target: '.tour-target-interview-qa',
    message: '**마이크나 텍스트**로 질문에 답변해요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-interview-submit',
    target: '.tour-target-interview-submit',
    message: '**답변 제출** 시 AI 총평과 피드백을 받아요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => {
      window.dispatchEvent(new CustomEvent('tour-exit-interview'));
      nav('/');
    }
  },
  {
    id: 'step-nav-home',
    target: '.tour-target-nav-home',
    message: '**MyStair 홈**에서 무엇이든 질문하세요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/'),
  },
  {
    id: 'outro',
    target: 'body',
    message: '모든 준비가 완료되었습니다! 지금 시작해보세요!',
    action: 'click_anywhere',
  }
];

export function OnboardingTour() {
  const { isLightMode } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isOutroClosing, setIsOutroClosing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Strictly check first-time eligibility
  useEffect(() => {
    const isMockUser = localStorage.getItem('mystair_mock_user');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true' || !!isMockUser;
    const accountKey = getEffectiveAccountKey();

    // The tour ONLY automatically starts if allowed for this account (1st login only, not 2nd, 3rd, etc.)
    if (isLoggedIn && !isActive && isTourAllowedForCurrentAccount(accountKey)) {
      sessionStorage.removeItem('mystair_auto_start_tour');
      setStepIndex(0);
      setIsOutroClosing(false);
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 350);
      return () => clearTimeout(timer);
    }

    // Event listener for manual user trigger (e.g. Help / Usage Guide button)
    const handleOpen = () => {
      setStepIndex(0);
      setIsActive(true);
      setIsOutroClosing(false);
    };
    window.addEventListener('open-onboarding-tour', handleOpen);
    return () => window.removeEventListener('open-onboarding-tour', handleOpen);
  }, [isActive]);

  // Update target rect with requestAnimationFrame
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;

    let raf: number;
    const updateRect = () => {
      const step = TOUR_STEPS[stepIndex];
      if (step && step.target !== 'body') {
        const els = document.querySelectorAll(step.target);
        let visibleEl = null;
        for (let i = 0; i < els.length; i++) {
          const rect = els[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            visibleEl = els[i];
            break;
          }
        }

        if (visibleEl) {
          setTargetRect(visibleEl.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
      raf = requestAnimationFrame(updateRect);
    };
    raf = requestAnimationFrame(updateRect);

    return () => cancelAnimationFrame(raf);
  }, [isActive, stepIndex, location.pathname]);

  // Ensure the appropriate tab is active in MyPage and route is synchronized for tour steps
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    if (step.id === 'step-nav-mypage' || step.id.startsWith('step-basic') || step.id.startsWith('step-edit') || step.id.startsWith('step-aptitude') || step.id.startsWith('step-mbti') || step.id.startsWith('step-holland') || step.id.startsWith('step-companies') || step.id.startsWith('step-settings')) {
      if (location.pathname !== '/mypage') {
        navigate('/mypage');
      } else {
        if (step.id === 'step-basic-info' || step.id === 'step-edit-profile') {
          const tabEl = document.querySelector('.tour-target-tab-profile') as HTMLElement;
          if (tabEl) tabEl.click();
        } else if (step.id === 'step-aptitude-tab' || step.id === 'step-mbti' || step.id === 'step-holland') {
          const tabEl = document.querySelector('.tour-target-tab-aptitude') as HTMLElement;
          if (tabEl) tabEl.click();
        } else if (step.id === 'step-companies-tab') {
          const tabEl = document.querySelector('.tour-target-tab-companies') as HTMLElement;
          if (tabEl) tabEl.click();
        } else if (step.id === 'step-settings-theme') {
          const tabEl = document.querySelector('.tour-target-tab-settings') as HTMLElement;
          if (tabEl) tabEl.click();
        }
      }
    } else if (step.id === 'step-nav-company' && location.pathname !== '/company-search') {
      navigate('/company-search');
    } else if (step.id === 'step-nav-cert' && location.pathname !== '/certificates') {
      navigate('/certificates');
    } else if (step.id.startsWith('step-diary')) {
      if (location.pathname !== '/diary') {
        navigate('/diary');
      } else {
        if (step.id === 'step-diary-title' || step.id === 'step-diary-mood' || step.id === 'step-diary-content') {
          const titleInput = document.querySelector('.tour-target-diary-title');
          if (!titleInput) {
            window.dispatchEvent(new CustomEvent('tour-open-diary'));
          }
        } else if (step.id === 'step-diary-summary') {
          window.dispatchEvent(new CustomEvent('tour-close-diary'));
        }
      }
    } else if (step.id.startsWith('step-coverletter')) {
      window.dispatchEvent(new CustomEvent('tour-close-diary'));
      if (location.pathname !== '/cover-letter') {
        navigate('/cover-letter');
      }
    } else if (step.id.startsWith('step-interview')) {
      if (location.pathname !== '/interview') {
        navigate('/interview');
      } else {
        if (step.id === 'step-interview-camera-hud' || step.id === 'step-interview-qa' || step.id === 'step-interview-submit') {
          const cameraHud = document.querySelector('.tour-target-interview-camera-hud');
          if (!cameraHud) {
            window.dispatchEvent(new CustomEvent('tour-enter-interview'));
          }
        } else if (step.id === 'step-interview-course' || step.id === 'step-interview-start') {
          const cameraHud = document.querySelector('.tour-target-interview-camera-hud');
          if (cameraHud) {
            window.dispatchEvent(new CustomEvent('tour-exit-interview'));
          }
        }
      }
    } else if (step.id === 'step-nav-home') {
      window.dispatchEvent(new CustomEvent('tour-exit-interview'));
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [isActive, stepIndex, location.pathname, navigate]);

  // Handle smooth scrolling when step changes
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;
    const step = TOUR_STEPS[stepIndex];
    if (step && step.target !== 'body') {
      const scrollTimer = setTimeout(() => {
        const els = document.querySelectorAll(step.target);
        let visibleEl = null;
        for (let i = 0; i < els.length; i++) {
          const rect = els[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            visibleEl = els[i];
            break;
          }
        }
        if (visibleEl) {
          visibleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [isActive, stepIndex, location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (isOutroClosing) return;

    const step = TOUR_STEPS[stepIndex];
    if (step.onNext) {
      step.onNext(navigate);
    }

    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      handleOutroClose();
    }
  };

  const handleOutroClose = () => {
    setIsOutroClosing(true);
    setTimeout(() => {
      endTour();
      navigate('/');
    }, 1000);
  };

  const endTour = () => {
    window.dispatchEvent(new CustomEvent('tour-close-diary'));
    window.dispatchEvent(new CustomEvent('tour-exit-interview'));
    markTourCompletedForCurrentAccount();
    setIsActive(false);
    setStepIndex(0);
    setIsOutroClosing(false);
  };

  if (!isActive) return null;

  // Intro Screen (Step 0) - 가이드 시작 질문 화면
  if (stepIndex === 0) {
    return (
      <div className={`fixed inset-0 z-[99999] backdrop-blur-md flex items-center justify-center p-6 font-sans animate-in fade-in duration-300 ${
        isLightMode ? 'bg-slate-900/60' : 'bg-black/95 sm:bg-black/90 text-white'
      }`}>
        <div className={`max-w-xl w-full text-center space-y-6 sm:space-y-8 px-5 py-8 sm:py-10 rounded-3xl border shadow-2xl ${
          isLightMode 
            ? 'bg-white text-slate-900 border-slate-200' 
            : 'bg-slate-950/90 text-white border-white/10'
        }`}>
          <div className="space-y-3">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight whitespace-nowrap ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              MyStair에 오신 것을 환영합니다!
            </h2>
            <p className={`font-medium text-base sm:text-lg leading-relaxed whitespace-nowrap ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}>
              가이드를 시작할까요?
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 max-w-sm sm:max-w-md mx-auto w-full">
            <button 
              type="button"
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] text-white py-4 rounded-xl font-bold text-lg transition-all cursor-pointer transform hover:scale-[1.02] active:scale-98"
            >
              네, 가이드 시작하기
            </button>
            <button 
              type="button"
              onClick={endTour}
              className={`w-full py-3.5 rounded-xl font-semibold text-base transition-colors cursor-pointer border active:scale-98 ${
                isLightMode 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
            >
              아니요, 바로 시작할게요
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = TOUR_STEPS[stepIndex];

  // Check if current target is near the top-right corner to avoid colliding with skip button
  const isTargetTopRight = Boolean(
    targetRect && 
    targetRect.y < 130 && 
    (targetRect.x + targetRect.width > windowSize.w - 380)
  );

  const getBubblePosition = () => {
    if (!targetRect) return { left: 16, top: 16 };
    
    const bubbleWidth = windowSize.w < 640 ? 290 : 330;
    const isNearTop = targetRect.y < 120;
    const isNearBottom = targetRect.y + 130 > windowSize.h;
    const isRightSide = (targetRect.x + targetRect.width + bubbleWidth + 20 > windowSize.w);

    let left = targetRect.x + targetRect.width + 20;
    let top = targetRect.y;

    if (windowSize.w < 640) {
      left = Math.max(12, Math.min(windowSize.w - bubbleWidth - 12, targetRect.x - 20));
      if (isNearTop) {
        top = targetRect.y + targetRect.height + 16;
      } else if (isNearBottom) {
        top = Math.max(16, targetRect.y - 95);
      }
    } else {
      if (isNearTop) {
        top = targetRect.y + targetRect.height + 16;
        if (isRightSide) {
          left = Math.max(16, Math.min(windowSize.w - bubbleWidth - 20, targetRect.x + targetRect.width - bubbleWidth + 20));
        } else {
          left = Math.max(16, targetRect.x);
        }
      } else if (isNearBottom) {
        top = Math.max(16, targetRect.y - 95);
        if (isRightSide) {
          left = Math.max(16, targetRect.x - bubbleWidth - 10);
        }
      } else {
        if (isRightSide) {
          left = Math.max(16, targetRect.x - bubbleWidth - 10);
        }
      }
    }

    // Viewport bounds clamp
    left = Math.max(12, Math.min(windowSize.w - bubbleWidth - 12, left));
    top = Math.max(12, Math.min(windowSize.h - 110, top));

    return { left, top };
  };

  // Active Tour Overlay
  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      
      {/* Controls: Step progress and skip button */}
      <div 
        className={`fixed z-[100002] pointer-events-auto flex items-center gap-2 transition-all duration-300 ${
          isTargetTopRight ? 'bottom-6 right-6' : 'top-4 right-4'
        }`}
      >
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${
          isLightMode 
            ? 'bg-white/95 text-teal-800 border-teal-200 shadow-slate-300/40' 
            : 'bg-slate-900/90 text-teal-300 border-teal-500/30'
        }`}>
          {stepIndex} / {TOUR_STEPS.length - 1}
        </span>
        <button 
          onClick={endTour}
          className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
            isLightMode 
              ? 'bg-white/95 hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-slate-300/40' 
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-white/20 hover:border-white/40'
          }`}
          title="가이드 건너뛰기"
        >
          <span>가이드 건너뛰기</span>
          <span className="text-slate-400">✕</span>
        </button>
      </div>
      
      {/* Background Mask */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-auto" onClick={() => {
        if (currentStep.action === 'click_anywhere' || currentStep.allowAnywhereClick || stepIndex === TOUR_STEPS.length - 1) {
          handleNext();
        }
      }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.x - 8} 
                y={targetRect.y - 8} 
                width={targetRect.width + 16} 
                height={targetRect.height + 16} 
                rx="12" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0, 0, 0, 0.75)" 
          mask="url(#tour-mask)" 
          className="transition-all duration-300"
        />
      </svg>

      {/* Target Interaction Area (Clickable Hotspot) */}
      {targetRect && (
        <div 
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: targetRect.x - 8,
            top: targetRect.y - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: 12,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          {/* Highlight Focus Frame */}
          <div className="absolute inset-0 rounded-xl border-2 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.45)] pointer-events-none animate-pulse" />
          <div className="absolute inset-0 rounded-xl border border-teal-400/50 pointer-events-none animate-ping opacity-30" />
        </div>
      )}

      {/* Outro specific styling */}
      {stepIndex === TOUR_STEPS.length - 1 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-4">
           <div 
            className="flex flex-row items-center justify-center gap-4 sm:gap-6 pointer-events-auto cursor-pointer"
            onClick={handleNext}
          >
            {/* Giant Character - Flies away on close */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={isOutroClosing ? {
                scale: 0.2,
                x: windowSize.w / 2,
                y: -windowSize.h / 2,
                rotate: 1080,
                opacity: 0,
              } : { 
                opacity: 1, 
                scale: 1, 
                x: 0,
                y: 0,
                rotate: 0
              }}
              transition={{ type: isOutroClosing ? 'tween' : 'spring', duration: isOutroClosing ? 1.0 : 0.6, ease: isOutroClosing ? "easeIn" : undefined }}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center overflow-hidden shrink-0 z-10"
            >
              <AlienUFOSvg className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
            </motion.div>

            {/* Giant Bubble */}
            <AnimatePresence>
              {!isOutroClosing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="bg-white text-slate-900 p-5 sm:p-7 rounded-3xl shadow-2xl font-bold text-[15px] sm:text-lg leading-relaxed border border-slate-200 max-w-md relative"
                >
                  <div className="whitespace-nowrap sm:whitespace-normal">
                    <TypewriterText text={currentStep.message} />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-semibold">
                    <span>가이드가 완료되었습니다</span>
                    <span className="text-teal-400 font-bold flex items-center gap-1">시작하기 →</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tooltip / Speech Bubble */}
      {targetRect && stepIndex !== TOUR_STEPS.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            left: getBubblePosition().left,
            top: getBubblePosition().top,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute pointer-events-none z-[100000] flex gap-3 items-start max-w-[290px] sm:max-w-[330px]"
        >
          {/* Character */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <AlienUFOSvg className="w-12 h-12 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" />
          </div>

          {/* Bubble */}
          <div className="bg-white text-slate-900 p-3.5 rounded-2xl rounded-tl-sm shadow-xl font-bold text-[13px] leading-relaxed border border-slate-200 flex-1 min-w-[160px]">
            <TypewriterText text={currentStep.message} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
