import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const interval = setInterval(() => {
      setDisplayedLength((prev) => prev + 1);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 40); // Fast typing speed
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="relative inline-block whitespace-pre-wrap">
      {/* Invisible full text to establish max width/height immediately */}
      <span className="invisible" aria-hidden="true">{text}</span>
      {/* Visible typed text positioned absolutely over the invisible one */}
      <span className="absolute left-0 top-0 w-full h-full text-left overflow-hidden break-words" style={{ clipPath: 'inset(0 0 0 0)' }}>
        {text.slice(0, displayedLength)}
      </span>
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
    message: '먼저 마이페이지를 들어가 주세요.',
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
    id: 'outro',
    target: '.tour-target-nav-home',
    message: '이제 MyStair와 함께 꿈에 한 발자국 더 나아가 봐요!',
    action: 'click_anywhere',
  }
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isLightMode } = useTheme();

  // Check if we need to start
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('mystair_seen_guide_onboarding');
    const isMockUser = localStorage.getItem('mystair_mock_user');
    const isLoggedIn = !!isMockUser || !!localStorage.getItem('auth_token'); // Simplified check

    if (!hasSeenGuide && isLoggedIn && stepIndex === 0 && !isActive) {
      // Small delay to ensure app is mounted
      setTimeout(() => {
        setIsActive(true);
      }, 500);
    }

    // Event listener for manual trigger
    const handleOpen = () => {
      setStepIndex(0);
      setIsActive(true);
    };
    window.addEventListener('open-onboarding-tour', handleOpen);
    return () => window.removeEventListener('open-onboarding-tour', handleOpen);
  }, [isActive, stepIndex]);

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
    const step = TOUR_STEPS[stepIndex];
    if (step.onNext) {
      step.onNext(navigate);
    }

    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    localStorage.setItem('mystair_seen_guide_onboarding', 'true');
    setIsActive(false);
    setStepIndex(0);
    navigate('/');
  };

  if (!isActive) return null;

  const currentStep = TOUR_STEPS[stepIndex];

  // Intro Screen (Step 0)
  if (stepIndex === 0) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-6 text-white font-sans animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto overflow-hidden">
            <AlienUFOSvg className="w-32 h-32 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-white">
              MyStair에 오신 것을 환영합니다!
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              가이드를 시작할까요?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-white py-4 rounded-xl font-bold text-lg transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              네, 가이드 시작하기
            </button>
            <button 
              onClick={endTour}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-xl font-bold text-lg transition-colors cursor-pointer border border-white/10"
            >
              아니요, 바로 시작할게요
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Tour Overlay
  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      
      {/* Background Mask */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-auto" onClick={() => {
        if (currentStep.action === 'click_anywhere' || currentStep.allowAnywhereClick) {
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
          {/* Pulse Effect */}
          {currentStep.action === 'click_target' && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-teal-500/50 border border-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></span>
            </span>
          )}
        </div>
      )}

      {/* Outro specific styling */}
      {stepIndex === TOUR_STEPS.length - 1 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-teal-500/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm pointer-events-auto cursor-pointer"
            onClick={endTour}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden">
              <AlienUFOSvg className="w-20 h-20 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
            </div>
            <p className="text-white font-bold text-center text-lg"><TypewriterText text={currentStep.message} /></p>
            <p className="text-slate-400 text-sm mt-2 font-medium">화면을 클릭하여 닫기</p>
          </motion.div>
        </div>
      )}

      {/* Tooltip / Speech Bubble */}
      {targetRect && stepIndex !== TOUR_STEPS.length - 1 && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            left: (targetRect.x + targetRect.width + 300 > windowSize.w) ? Math.max(10, targetRect.x - 290) : targetRect.x + targetRect.width + 20,
            top: (targetRect.y + 100 > windowSize.h) ? Math.max(10, targetRect.y - 80) : targetRect.y,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute pointer-events-none z-[100000] flex gap-3 items-start max-w-[280px]"
        >
          {/* Character */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <AlienUFOSvg className="w-12 h-12 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" />
          </div>

          {/* Bubble */}
          <div className="bg-white text-slate-900 p-3 rounded-2xl rounded-tl-sm shadow-xl font-bold text-[13px] leading-relaxed border-2 border-pink-100 flex-1 min-w-[150px]">
            <TypewriterText text={currentStep.message} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
