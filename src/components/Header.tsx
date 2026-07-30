import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';

export default function Header() {
  const { t } = useLanguage();

  const navItems = [
    { name: '성장다이어리', path: '/diary' },
    { name: '자격증 가이드', path: '/certificates' },
    { name: '나만의 기업찾기', path: '/' },
    { name: 'MBTI검사', path: '/mbti' },
    { name: '홀랜드 진로적성 검사', path: '/holland' },
    { name: '만든 사람들', path: '/creators' },
    { name: '마이페이지', path: '/mypage' }
  ];

  return (
    <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 w-full max-w-[1600px] mx-auto">
      <Link to="/" className="text-white font-black text-2xl sm:text-[32px] tracking-[-0.06em] cursor-pointer flex items-center gap-2 leading-none group select-none transition-all duration-300 hover:scale-105 active:scale-95">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[34px] sm:h-[34px]">
          <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
          <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
        </svg>
        <span className="group-hover:text-teal-300 transition-colors duration-300">Mystair</span>
      </Link>
      
      <nav className="hidden xl:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
        {navItems.map(item => (
          <Link key={item.name} to={item.path} className="text-white/80 hover:text-white transition-colors text-[15px] font-medium whitespace-nowrap">
            {t(item.name)}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/';
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:scale-105 whitespace-nowrap"
        >
          <span>🌐 <span className="hidden sm:inline">홍보사이트 </span>보기</span>
        </button>
        <div className="xl:hidden text-white cursor-pointer ml-1 sm:ml-2">
          <Menu size={24} className="sm:w-[28px] sm:h-[28px]" />
        </div>
      </div>
    </header>
  );
}

