import { useState } from 'react';
import { Menu, X, BookOpen, Award, Briefcase, Brain, Compass, Users, User, Globe, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
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
      <header className="relative z-20 flex items-center justify-between px-2.5 sm:px-6 py-2.5 sm:py-5 w-full max-w-full sm:max-w-[1600px] mx-auto box-border overflow-x-hidden min-w-0">
        <Link to="/" className="text-white font-black text-lg sm:text-2xl md:text-[32px] tracking-[-0.06em] cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-none group select-none transition-all duration-300 hover:scale-105 active:scale-95 shrink-0">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[34px] sm:h-[34px] shrink-0">
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
          </svg>
          <span className="group-hover:text-teal-300 transition-colors duration-300 shrink-0">Mystair</span>
        </Link>
        
        <nav className="hidden xl:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
          {navItems.slice(1, -1).map(item => (
            <Link key={item.name} to={item.path} className="text-white/80 hover:text-white transition-colors text-[15px] font-medium whitespace-nowrap">
              {t(item.name)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Promo Site Button (Icon & mini label on mobile, full label on tablet/desktop) */}
          <button
            onClick={() => {
              sessionStorage.setItem('viewingPromo', 'true');
              window.location.href = '/';
            }}
            title={t('홍보사이트 보기')}
            className="flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.15)] active:scale-95 whitespace-nowrap min-h-[36px] sm:min-h-[38px] shrink-0"
          >
            <Globe size={15} className="shrink-0" />
            <span className="hidden sm:inline">{t('홍보사이트 보기')}</span>
            <span className="inline sm:hidden">{t('홍보')}</span>
          </button>

          {/* Language Switcher Compact Toggle Button */}
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-0.5 text-[10px] sm:text-xs shrink-0">
            <button 
              onClick={() => setLanguage('ko')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'ko' 
                  ? 'bg-teal-400 text-slate-950 shadow-sm' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">한국어</span>
              <span className="inline sm:hidden">한</span>
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'en' 
                  ? 'bg-teal-400 text-slate-950 shadow-sm' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">English</span>
              <span className="inline sm:hidden">EN</span>
            </button>
          </div>

          {/* Mobile Menu Icon Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('메뉴 열기', 'Open Menu')}
            title={t('메뉴 열기', 'Open Menu')}
            className="xl:hidden text-white cursor-pointer p-2 rounded-xl hover:bg-white/10 active:bg-white/20 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors shrink-0"
          >
            <Menu size={22} />
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
          <div className="relative w-[85vw] max-w-[320px] bg-slate-950/95 border-l border-white/15 h-full p-5 text-white flex flex-col justify-between shadow-2xl z-10 overflow-y-auto box-border">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2 font-black text-lg text-teal-300 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 shrink-0">
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
                  </svg>
                  <span className="whitespace-nowrap">{t('Mystair 메뉴', 'Mystair Menu')}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shrink-0"
                  aria-label={t('메뉴 닫기', 'Close Menu')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all min-h-[44px] whitespace-nowrap word-keep"
                  >
                    <span className="text-teal-400 shrink-0">{item.icon}</span>
                    <span className="truncate">{t(item.name)}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-white/10 flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  sessionStorage.setItem('viewingPromo', 'true');
                  window.location.href = '/';
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs sm:text-sm min-h-[44px] active:scale-98 transition-all whitespace-nowrap cursor-pointer"
              >
                <Globe size={16} className="shrink-0" />
                <span>{t('홍보사이트 보기')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

