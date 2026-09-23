import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Briefcase, 
  User,
  LogOut,
  LogIn,
  Sparkles,
  FileText,
  Camera,
  Brain,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const { user, userProfile, logout, loginWithGoogle } = useAuth();
  const { clearChat } = useChat();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const location = useLocation();
  const { isLightMode } = useTheme();
  
  const isDarkTheme = !isLightMode && (location.pathname === '/' || location.pathname === '/diary' || location.pathname === '/interview' || location.pathname === '/cover-letter' || location.pathname === '/mypage' || location.pathname === '/profile' || location.pathname === '/mbti' || location.pathname === '/holland' || location.pathname === '/certificates' || location.pathname === '/company-search');

  const displayName = userProfile?.name || user?.displayName || (t('게스트', 'Guest'));

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.removeItem('isLoggedIn');
    logout().then(() => {
      window.location.href = '/';
    }).catch(() => {
      window.location.href = '/';
    });
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearChat();
    navigate('/');
  };

  const mainItems = [
    { name: 'MyStair AI', path: '/', icon: Sparkles, tourClass: 'tour-target-nav-home' },
    { name: '성장다이어리', path: '/diary', icon: BookOpen, tourClass: 'tour-target-nav-diary' },
    { name: '모의면접', path: '/interview', icon: Camera, tourClass: 'tour-target-nav-interview' },
    { name: '자기소개서 작성', path: '/cover-letter', icon: FileText, tourClass: 'tour-target-nav-coverletter' },
  ];

  const exploreItems = [
    { name: '자격증 가이드', path: '/certificates', icon: Award, tourClass: 'tour-target-nav-cert' },
    { name: '나만의 기업찾기', path: '/company-search', icon: Briefcase, tourClass: 'tour-target-nav-company' },
  ];

  const testItems = [
    { name: 'MBTI검사', path: '/mbti', icon: Brain, tourClass: 'tour-target-nav-mbti' },
    { name: '홀랜드 진로적성 검사', path: '/holland', icon: Compass, tourClass: 'tour-target-nav-holland' },
  ];

  const renderNavItem = (item: { name: string; path: string; icon: any; tourClass?: string }) => {
    const isActive = (item.path === '/' && location.pathname === '/') || 
                     (item.path !== '/' && location.pathname === item.path);
    const Icon = item.icon;

    return (
      <Link 
        key={item.path} 
        to={item.path} 
        title={t(item.name)}
        className={`group flex items-center transition-colors duration-150 whitespace-nowrap ${item.tourClass || ''} ${
          // Mobile layout: column centered in 72px bottom bar
          'flex-col justify-center gap-1 py-1.5 px-2 flex-1 sm:flex-none'
        } ${
          // Desktop layout: fixed 40px height, full-width within px-3 container (40px square collapsed, 232px wide expanded)
          'sm:flex-row sm:w-full sm:h-10 sm:p-0 sm:justify-start sm:rounded-xl overflow-hidden'
        } ${
          isActive 
            ? (isDarkTheme 
                ? 'text-teal-300 sm:bg-white/15 font-bold sm:border sm:border-white/10 sm:shadow-xs' 
                : 'text-emerald-800 sm:bg-emerald-50 sm:text-emerald-900 font-bold sm:border sm:border-emerald-200/80 sm:shadow-xs')
            : (isDarkTheme 
                ? 'text-white/60 hover:text-white sm:hover:bg-white/10 font-medium' 
                : 'text-slate-600 hover:text-slate-900 sm:hover:bg-slate-100 font-medium')
        }`}
      >
        {/* Fixed 40x40 icon anchor on desktop (remains at exact same position whether expanded or collapsed) */}
        <div className="shrink-0 flex items-center justify-center w-5 h-5 sm:w-10 sm:h-10">
          <Icon 
            size={20} 
            className={`transition-colors duration-150 ${
              isActive 
                ? (isLightMode ? 'text-emerald-600' : 'text-teal-300') 
                : (isLightMode ? 'text-slate-600 group-hover:text-slate-900' : 'text-white/70 group-hover:text-white')
            }`} 
          />
        </div>

        {/* Desktop text: slides and fades in smoothly without reflowing layout */}
        <div className="hidden sm:flex items-center overflow-hidden min-w-0 flex-1">
          <span className={`text-[13.5px] font-semibold truncate whitespace-nowrap transition-all duration-200 ease-out ${
            isHovered 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-2 pointer-events-none'
          }`}>
            {t(item.name)}
          </span>
        </div>

        {/* Mobile text label */}
        <span className="text-[10px] sm:hidden font-medium truncate max-w-[56px]">
          {t(item.name)}
        </span>
      </Link>
    );
  };

  return (
    <aside 
      className={`fixed z-[100] transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex ${
        isDarkTheme 
          ? 'bg-slate-950/80 sm:bg-slate-950/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-white/10 text-white shadow-[0_-5px_25px_rgba(0,0,0,0.3)] sm:shadow-[0_0_25px_rgba(0,0,0,0.3)]' 
          : 'bg-white/80 sm:bg-white/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-slate-200/60 text-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] sm:shadow-[0_0_20px_rgba(0,0,0,0.03)]'
      } bottom-0 left-0 w-full h-[72px] flex-row sm:flex-col sm:bottom-auto sm:top-0 sm:h-full overflow-hidden ${isHovered ? 'sm:w-64' : 'sm:w-16'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop Logo Header (Never switches elements, smooth slide) */}
      <div className={`hidden sm:flex h-[72px] items-center px-3 overflow-hidden whitespace-nowrap shrink-0 border-b ${
        isDarkTheme ? 'border-white/10' : 'border-slate-200/80'
      }`}>
        <a 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center w-full h-10 rounded-xl select-none group transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isLightMode ? 'text-teal-600' : 'text-teal-400'} group-hover:rotate-180 transition-transform duration-500 ease-out`}>
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
            </svg>
          </div>
          <div className="flex items-center overflow-hidden min-w-0">
            <span className={`font-black text-[22px] tracking-[-0.06em] leading-none transition-all duration-200 ease-out whitespace-nowrap ${
              isHovered 
                ? 'opacity-100 translate-x-0 ml-1' 
                : 'opacity-0 -translate-x-2 pointer-events-none'
            } ${isDarkTheme ? 'text-white hover:text-teal-300' : 'text-slate-900 hover:text-teal-600'}`}>
              Mystair
            </span>
          </div>
        </a>
      </div>
      
      {/* Navigation items (Consistent layout, zero vertical jumping) */}
      <nav className="flex-1 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden flex sm:flex-col justify-around sm:justify-start gap-1 scrollbar-hide py-0 sm:py-3 px-2 sm:px-3">
        {/* 1. Main Navigation (Home, 성장다이어리, 모의면접, 자소서) */}
        <div className="flex sm:flex-col gap-1 w-full">
          {mainItems.map(renderNavItem)}
        </div>

        {/* Fixed-height Divider 1: 탐색 & 지원 (Never causes lower items to jump vertically) */}
        <div className="hidden sm:flex items-center h-6 my-1 relative shrink-0 overflow-hidden">
          <div className={`h-[1px] transition-all duration-300 ${
            isDarkTheme ? 'bg-white/10' : 'bg-slate-200'
          } ${isHovered ? 'w-full opacity-40' : 'w-7 mx-auto opacity-100'}`} />
          <span className={`absolute left-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
          } ${isDarkTheme ? 'text-slate-400 bg-slate-950/90 px-1 rounded' : 'text-slate-500 bg-white/90 px-1 rounded'}`}>
            {t('탐색 & 지원')}
          </span>
        </div>

        {/* 2. 탐색 & 지원 (자격증 가이드, 기업찾기) */}
        <div className="flex sm:flex-col gap-1 w-full">
          {exploreItems.map(renderNavItem)}
        </div>

        {/* Fixed-height Divider 2: 검사 (Never causes lower items to jump vertically) */}
        <div className="hidden sm:flex items-center h-6 my-1 relative shrink-0 overflow-hidden">
          <div className={`h-[1px] transition-all duration-300 ${
            isDarkTheme ? 'bg-white/10' : 'bg-slate-200'
          } ${isHovered ? 'w-full opacity-40' : 'w-7 mx-auto opacity-100'}`} />
          <span className={`absolute left-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
          } ${isDarkTheme ? 'text-slate-400 bg-slate-950/90 px-1 rounded' : 'text-slate-500 bg-white/90 px-1 rounded'}`}>
            {t('검사')}
          </span>
        </div>

        {/* 3. 검사 (MBTI, 홀랜드) */}
        <div className="flex sm:flex-col gap-1 w-full">
          {testItems.map(renderNavItem)}
        </div>

        {/* Mobile MyPage icon */}
        <Link 
          to="/mypage" 
          title={t('마이페이지 겸 설정')}
          className={`flex sm:hidden flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors min-h-[48px] tour-target-nav-mypage-mobile ${
            location.pathname === '/mypage' 
              ? (isDarkTheme ? 'text-teal-300 font-semibold' : 'text-teal-700 font-bold')
              : (isDarkTheme ? 'text-white/50 hover:text-white font-medium' : 'text-slate-400 hover:text-slate-800 font-medium')
          }`}
        >
          <div className="shrink-0 flex items-center justify-center w-6 h-6">
            {userProfile?.avatarUrl || user?.photoURL ? (
              <img 
                src={userProfile?.avatarUrl || user?.photoURL || ''} 
                alt={t('프로필')} 
                className="w-6 h-6 rounded-full object-cover shadow-sm"
              />
            ) : (
              <User size={22} />
            )}
          </div>
          <span className="text-[10px] mt-1">
            {t('마이페이지 겸 설정')}
          </span>
        </Link>
      </nav>

      {/* Desktop Profile Section (Zero jumping, perfect 40px alignment) */}
      <div className={`hidden sm:flex shrink-0 py-3 px-3 border-t overflow-hidden ${
        isDarkTheme ? 'border-white/10 bg-transparent' : 'border-slate-200/80 bg-slate-50/50'
      }`}>
        <div className="flex items-center w-full h-10 overflow-hidden">
          <Link 
            to="/mypage" 
            title={t('마이페이지 겸 설정', 'My Page & Settings')}
            className="flex items-center min-w-0 flex-1 cursor-pointer group tour-target-nav-mypage-desktop"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              {userProfile?.avatarUrl || user?.photoURL ? (
                <img 
                  src={userProfile?.avatarUrl || user?.photoURL || ''} 
                  alt={t('프로필')} 
                  className="w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full object-cover shrink-0 transition-transform group-hover:scale-105 shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white shadow-sm">
                  <User size={14} className="shrink-0" />
                </div>
              )}
            </div>

            <div className={`flex flex-col overflow-hidden min-w-0 transition-all duration-200 ease-out ${
              isHovered ? 'opacity-100 translate-x-0 ml-1.5' : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}>
              <span className={`text-[13px] font-bold leading-tight truncate group-hover:text-teal-400 transition-colors ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                {displayName}
              </span>
              <span className={`text-[11px] truncate font-medium ${isDarkTheme ? 'text-teal-300' : 'text-teal-600'}`}>
                {t('마이페이지 겸 설정', 'My Page & Settings')}
              </span>
            </div>
          </Link>

          <div className={`flex items-center gap-1 shrink-0 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}>
            {!user && (
              <button 
                onClick={() => loginWithGoogle()}
                title={t('구글 로그인')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDarkTheme ? 'hover:bg-white/10 text-teal-300 hover:text-white' : 'hover:bg-slate-200 text-teal-600 hover:text-teal-800'
                }`}
              >
                <LogIn size={14} />
              </button>
            )}
            <button 
              onClick={handleLogout}
              title={user ? t('로그아웃') : t('홍보 페이지로 이동')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkTheme ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
