import { useState } from 'react';
import { Menu, X, BookOpen, Award, Briefcase, Brain, Compass, Users, User, Globe, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';

export default function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'MyStair AI 홈', path: '/', icon: <Sparkles size={18} className="text-teal-400" /> },
    { name: '성장다이어리', path: '/diary', icon: <BookOpen size={18} /> },
    { name: '자격증 가이드', path: '/certificates', icon: <Award size={18} /> },
    { name: '나만의 기업찾기', path: '/company-search', icon: <Briefcase size={18} /> },
    { name: 'MBTI검사', path: '/mbti', icon: <Brain size={18} /> },
    { name: '홀랜드 진로적성 검사', path: '/holland', icon: <Compass size={18} /> },
    { name: '만든 사람들', path: '/creators', icon: <Users size={18} /> },
    { name: '마이페이지', path: '/mypage', icon: <User size={18} /> }
  ];

  return (
    <>
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-6 w-full max-w-[1600px] mx-auto">
        <Link to="/" className="text-white font-black text-xl sm:text-2xl md:text-[32px] tracking-[-0.06em] cursor-pointer flex items-center gap-2 leading-none group select-none transition-all duration-300 hover:scale-105 active:scale-95">
          <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[34px] sm:h-[34px]">
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
          </svg>
          <span className="group-hover:text-teal-300 transition-colors duration-300">Mystair</span>
        </Link>
        
        <nav className="hidden xl:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
          {navItems.slice(1, -1).map(item => (
            <Link key={item.name} to={item.path} className="text-white/80 hover:text-white transition-colors text-[15px] font-medium whitespace-nowrap">
              {t(item.name)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sessionStorage.setItem('viewingPromo', 'true');
              window.location.href = '/';
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 text-xs sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.15)] active:scale-95 whitespace-nowrap min-h-[44px] sm:min-h-[38px]"
          >
            <Globe size={15} className="shrink-0" />
            <span>{t('홍보사이트 보기')}</span>
          </button>

          <button 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴 열기"
            className="xl:hidden text-white cursor-pointer p-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-950/95 border-l border-white/15 h-full p-6 text-white flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2 font-black text-xl text-teal-300">
                  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400">
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
                  </svg>
                  <span>Mystair 메뉴</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl hover:bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
                  aria-label="메뉴 닫기"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all min-h-[48px]"
                  >
                    <span className="text-teal-400 shrink-0">{item.icon}</span>
                    <span className="truncate">{t(item.name)}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-3 mt-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  sessionStorage.setItem('viewingPromo', 'true');
                  window.location.href = '/';
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-300 font-bold text-sm min-h-[48px] active:scale-98 transition-all"
              >
                <Globe size={18} />
                <span>{t('홍보사이트 보기')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

