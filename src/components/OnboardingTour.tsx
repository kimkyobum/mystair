import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlienUFOSvg } from './FloatingAliens';
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
    message: '가이드를 시작하시겠습니까?',
    action: 'click_anywhere',
  },
  {
    id: 'step-nav-mypage',
    target: '.tour-target-nav-mypage-desktop, .tour-target-nav-mypage-mobile',
    message: '먼저 사이드바의 **마이페이지**를 눌러 프로필과 맞춤 설정을 시작해 볼까요?',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/mypage'),
  },
  {
    id: 'step-basic-info',
    target: '.tour-target-profile-academic, .tour-target-tab-profile',
    message: '**기본 정보 & 학적**에서 나의 고등학교, 전공 학과, 인적 사항을 한눈에 확인할 수 있어요.',
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
    message: '**수정하기(프로필 편집)** 버튼을 눌러 나의 학교, 학과, 성명 등 기본 정보를 손쉽게 수정하고 등록할 수 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-aptitude-tab',
    target: '.tour-target-tab-aptitude',
    message: '**진로 적성 진단** 탭을 눌러 MBTI 성격 유형과 직업 적성 검사를 확인해 볼까요?',
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
    message: '**MBTI 진단**을 통해 나의 성향에 어울리는 추천 직무를 파악하거나, 검사 없이 직접 유형을 간편 선택할 수도 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-holland',
    target: '.tour-target-profile-holland',
    message: '**홀랜드 직업 적성 검사**로 나에게 최적화된 산업 분야와 맞춤 추천 복합 유형(RIASEC)을 확인해 보세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'step-companies-tab',
    target: '.tour-target-tab-companies',
    message: '**희망 목표 기업** 탭에서는 관심 있는 공기업, 대기업을 등록하고 목표 달성을 위한 맞춤 취업 정보를 관리할 수 있어요.',
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
    message: '**환경 설정**에서 나의 눈과 취향에 맞게 **화이트(라이트) 배경** 또는 별빛 가득한 **검은(우주) 배경**을 자유롭게 설정할 수 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      const el = document.querySelector('.tour-target-tab-settings') as HTMLElement;
      if (el) el.click();
    }
  },
  {
    id: 'step-nav-company',
    target: '.tour-target-nav-company',
    message: '**나만의 기업찾기**는 마이페이지에 등록된 전공과 적성을 MYSTAIR AI가 종합 분석하여 최적의 대기업과 공기업을 추천해 주는 기능이에요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/company-search'),
  },
  {
    id: 'step-nav-cert',
    target: '.tour-target-nav-cert',
    message: '**자격증 가이드**에서는 마이스터고 전공 분야별 필수 자격증 정보와 원서접수 공식 홈페이지 링크를 한곳에서 쉽게 찾아볼 수 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/certificates'),
  },
  {
    id: 'step-nav-diary',
    target: '.tour-target-nav-diary',
    message: '**성장 다이어리**를 눌러 매일의 전공 실습, 자격증 공부, 학교 생활을 일기로 기록하고 역량을 체계적으로 쌓아보세요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/diary'),
  },
  {
    id: 'step-nav-coverletter',
    target: '.tour-target-nav-coverletter',
    message: '**자기소개서 작성** 기능에서는 지금까지 기록한 다이어리를 바탕으로 AI가 STAR 기법에 맞춘 합격 자기소개서를 완성해줘요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/cover-letter'),
  },
  {
    id: 'step-nav-interview',
    target: '.tour-target-nav-interview',
    message: '**모의 면접**에서는 희망하는 기업과 직무의 예상 면접 질문을 실전처럼 연습하고 AI 맞춤 피드백을 받을 수 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/interview'),
  },
  {
    id: 'step-nav-home',
    target: '.tour-target-nav-home',
    message: '이제 중심이 되는 **MYSTAIR AI 홈**으로 이동해 볼까요? 언제든 AI와 대화하며 학습과 취업 질문을 나눌 수 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: (nav) => nav('/'),
  },
  {
    id: 'outro',
    target: 'body',
    message: '축하합니다! 이제 **MyStair**와 함께 꿈을 향해 멋지게 도약해 봐요!',
    action: 'click_anywhere',
  }
];

export function OnboardingTour() {
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

  // Ensure the appropriate tab is active in MyPage for profile tour steps
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    if (location.pathname === '/mypage') {
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
  }, [isActive, stepIndex, location.pathname]);

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
    markTourCompletedForCurrentAccount();
    setIsActive(false);
    setStepIndex(0);
    setIsOutroClosing(false);
  };

  if (!isActive) return null;

  // Intro Screen (Step 0) - 검은색 창과 가이드 시작 질문 화면
  if (stepIndex === 0) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/95 sm:bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-white font-sans animate-in fade-in duration-300">
        <div className="max-w-xl w-full text-center space-y-8 px-2">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight whitespace-nowrap">
              MyStair에 오신 것을 환영합니다!
            </h2>
            <p className="text-slate-400 font-medium text-base sm:text-lg leading-relaxed whitespace-nowrap">
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
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3.5 rounded-xl font-semibold text-base transition-colors cursor-pointer border border-white/10 active:scale-98"
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
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/90 text-teal-300 border border-teal-500/30 backdrop-blur-md shadow-lg">
          {stepIndex} / {TOUR_STEPS.length - 1}
        </span>
        <button 
          onClick={endTour}
          className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/20 hover:border-white/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
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
