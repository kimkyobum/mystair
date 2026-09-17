import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MousePointerClick } from 'lucide-react';
import { useLanguage } from '../friend_site/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { AlienUFOSvg } from './FloatingAliens';

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
    }, 40); // Fast typing speed
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
            <strong key={partIndex} className="text-indigo-600 font-extrabold">
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

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    target: 'body',
    message: '가이드를 시작하시겠습니까?',
    action: 'click_anywhere', // Handled specially in render
  },
  {
    id: 'nav-mypage',
    target: '.tour-target-nav-mypage-desktop, .tour-target-nav-mypage-mobile',
    message: '먼저 **마이페이지**를 눌러 시작해 볼까요?',
    action: 'click_target',
    onNext: (nav) => nav('/mypage'),
  },
  {
    id: 'edit-mode',
    target: '.tour-target-edit-mode',
    message: '전체 편집 모드를 눌러주세요.',
    action: 'click_target',
    onNext: () => {
      const el = document.querySelector('.tour-target-edit-mode') as HTMLElement;
      if (el) el.click();
    }
  },
  {
    id: 'profile-name',
    target: '.tour-target-profile-name',
    message: '이름을 설정해주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'profile-school',
    target: '.tour-target-profile-school',
    message: '고등학교를 설정해주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'profile-major',
    target: '.tour-target-profile-major',
    message: '전공 학과를 설정해주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'profile-mbti',
    target: '.tour-target-profile-mbti',
    message: 'MBTI를 설정해주세요. (상세 분석에서 검사 가능)',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'profile-holland',
    target: '.tour-target-profile-holland',
    message: '홀랜드 진로적성을 설정해주세요. (상세 분석에서 검사 가능)',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'profile-company',
    target: '.tour-target-profile-company',
    message: '희망 기업을 설정해주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      const el = document.querySelector('.tour-target-edit-mode') as HTMLElement;
      if (el) el.click(); // Save mode
    }
  },
  {
    id: 'nav-company',
    target: '.tour-target-nav-company',
    message: '나만의 기업찾기 기능은 사용자님의 마이페이지를 분석하여 선별한 최적의 대기업과 공기업이에요.',
    action: 'click_target',
    onNext: (nav) => nav('/company-search'),
  },
  {
    id: 'nav-cert',
    target: '.tour-target-nav-cert',
    message: '자격증에 대한 모든 걸 알려드리는 기능이에요.',
    action: 'click_target',
    onNext: (nav) => nav('/certificates'),
  },
  {
    id: 'nav-diary',
    target: '.tour-target-nav-diary',
    message: '성장 다이어리를 눌러주세요.',
    action: 'click_target',
    onNext: (nav) => nav('/diary'),
  },
  {
    id: 'diary-today',
    target: '.tour-target-diary-today',
    message: '오늘 날짜를 눌러 일기를 써보세요.',
    action: 'click_target',
    onNext: () => {
      setTimeout(() => {
        const el = document.querySelector('.tour-target-diary-today') as HTMLElement;
        if (el) el.click();
      }, 300);
    }
  },
  {
    id: 'diary-title',
    target: '.tour-target-diary-title',
    message: '오늘의 제목을 적어주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'diary-mood',
    target: '.tour-target-diary-mood',
    message: '오늘의 기분을 선택해주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'diary-content',
    target: '.tour-target-diary-content',
    message: '오늘 실습이나 배운 내용을 자세히 적어주세요.',
    action: 'click_target',
    allowAnywhereClick: true,
    onNext: () => {
      // Close the modal by clicking the background or close button
      const closeBtn = document.querySelector('.tour-target-close-modal');
      if (closeBtn) (closeBtn as HTMLElement).click();
    }
  },
  {
    id: 'exam-schedule',
    target: '.tour-target-exam-schedule',
    message: '시험 일정을 등록하고 관리할 수 있어요.',
    action: 'click_anywhere',
  },
  {
    id: 'resume-summary',
    target: '.tour-target-resume-summary',
    message: '지금까지 쓴 다이어리를 바탕으로 자소서를 요약해줘요.',
    action: 'click_anywhere',
  },
  {
    id: 'nav-home',
    target: '.tour-target-nav-home',
    message: '이제 핵심인 MyStair 버튼을 눌러주세요.',
    action: 'click_target',
    onNext: (nav) => nav('/'),
  },
  {
    id: 'home-diary-btn',
    target: '.tour-target-home-diary-btn',
    message: '오늘의 다이어리 작성을 눌러 간편하게 일기를 시작할 수도 있어요.',
    action: 'click_target',
    allowAnywhereClick: true,
  },
  {
    id: 'outro',
    target: 'body',
    message: '이제 **MyStair**와 함께 꿈에 한 발자국 더 나아가 봐요!',
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
  const { t } = useLanguage();
  const { isLightMode } = useTheme();

  // Check if we need to start
  useEffect(() => {
    const shouldAutoStart = sessionStorage.getItem('mystair_auto_start_tour') === 'true';
    const hasSeenGuide = localStorage.getItem('mystair_seen_guide_onboarding');
    const isMockUser = localStorage.getItem('mystair_mock_user');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true' || !!isMockUser; 

    if ((shouldAutoStart || !hasSeenGuide) && isLoggedIn && !isActive) {
      if (shouldAutoStart) {
        sessionStorage.removeItem('mystair_auto_start_tour');
      }
      setStepIndex(0);
      setIsOutroClosing(false);
      // Small delay to ensure DOM is ready after login redirect
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 350);
      return () => clearTimeout(timer);
    }

    // Event listener for manual trigger
    const handleOpen = () => {
      setStepIndex(0);
      setIsActive(true);
      setIsOutroClosing(false);
    };
    window.addEventListener('open-onboarding-tour', handleOpen);
    return () => window.removeEventListener('open-onboarding-tour', handleOpen);
  }, [isActive]);

  // Update target rect
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;

    let raf: number;
    const updateRect = () => {
      const step = TOUR_STEPS[stepIndex];
      if (step && step.target !== 'body') {
        const els = document.querySelectorAll(step.target);
        // If multiple targets (like mobile/desktop nav), pick the visible one
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

  // Handle scrolling when step changes
  useEffect(() => {
    if (!isActive || stepIndex === 0) return;
    const step = TOUR_STEPS[stepIndex];
    if (step && step.target !== 'body') {
      setTimeout(() => {
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
      }, 100);
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
    // Wait for the fly-away animation to finish
    setTimeout(() => {
      endTour();
      navigate('/');
    }, 1000);
  };

  const endTour = () => {
    localStorage.setItem('mystair_seen_guide_onboarding', 'true');
    sessionStorage.removeItem('mystair_auto_start_tour');
    setIsActive(false);
    setStepIndex(0);
    setIsOutroClosing(false);
  };

  if (!isActive) return null;

  // Intro Screen (Step 0) - 검은색 창과 가이드 시작 질문 화면
  if (stepIndex === 0) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/95 sm:bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-white font-sans animate-in fade-in duration-300">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              MyStair에 오신 것을 환영합니다!
            </h2>
            <p className="text-slate-400 font-medium text-base sm:text-lg leading-relaxed">
              가이드를 시작할까요?
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="button"
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 shadow-[0_0_25px_rgba(236,72,153,0.35)] text-white py-4 rounded-xl font-bold text-lg transition-all cursor-pointer transform hover:scale-[1.02] active:scale-98"
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

  // Active Tour Overlay
  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      
      {/* Top Controls: Step progress and skip button */}
      <div className="absolute top-4 right-4 z-[100002] pointer-events-auto flex items-center gap-2">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-lg">
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
            if (currentStep.action === 'click_target') {
              handleNext();
            } else if (currentStep.action === 'click_anywhere' || currentStep.allowAnywhereClick) {
              handleNext();
            }
          }}
        >
          {/* Target Highlight & Touch Guidance Effect */}
          {currentStep.action === 'click_target' && (
            <>
              {/* Highlight Focus Frame */}
              <div className="absolute inset-0 rounded-xl border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.45)] pointer-events-none animate-pulse" />
              <div className="absolute inset-0 rounded-xl border border-indigo-400/50 pointer-events-none animate-ping opacity-30" />
              
              {/* Refined Click / Tap Badge Indicator */}
              <div className={`absolute ${targetRect.y + targetRect.height > (typeof window !== 'undefined' ? window.innerHeight - 50 : 600) ? '-top-3' : '-bottom-3'} right-1 sm:right-2 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/40 border border-indigo-300/40 animate-bounce`}>
                <MousePointerClick className="w-3.5 h-3.5 text-indigo-100" />
                <span className="text-[11px] font-bold tracking-tight">클릭</span>
              </div>
            </>
          )}
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
                x: windowSize.w / 2, // Fly to top right
                y: -windowSize.h / 2,
                rotate: 1080, // Spin more
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

            {/* Giant Bubble - Disappears immediately on close */}
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
                    <span className="text-indigo-600 font-bold flex items-center gap-1">시작하기 →</span>
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
            left: windowSize.w < 640 
              ? Math.max(12, Math.min(windowSize.w - 300, targetRect.x - 20))
              : (targetRect.x + targetRect.width + 320 > windowSize.w)
                ? Math.max(16, targetRect.x - 310)
                : targetRect.x + targetRect.width + 20,
            top: (targetRect.y + 110 > windowSize.h) 
              ? Math.max(16, targetRect.y - 95) 
              : Math.max(16, targetRect.y),
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute pointer-events-none z-[100000] flex gap-3 items-start max-w-[290px] sm:max-w-[320px]"
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
