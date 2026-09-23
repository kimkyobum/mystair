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
  Camera
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

  const coreItems = [
    { 
      name: '성장다이어리', 
      path: '/diary', 
      badge: 'STAR 기록',
      color: 'emerald',
      tourClass: 'tour-target-nav-diary',
      icon: (active: boolean) => (
        <BookOpen size={19} className={active ? (isLightMode ? 'text-emerald-700' : 'text-emerald-300') : (isLightMode ? 'text-emerald-600' : 'text-emerald-400')} />
      )
    },
    { 
      name: '모의면접', 
      path: '/interview', 
      badge: 'AI 실시간',
      color: 'indigo',
      tourClass: 'tour-target-nav-interview',
      icon: (active: boolean) => (
        <Camera size={19} className={active ? (isLightMode ? 'text-indigo-700' : 'text-indigo-300') : (isLightMode ? 'text-indigo-600' : 'text-indigo-400')} />
      )
    },
    { 
      name: '자기소개서 작성', 
      path: '/cover-letter', 
      badge: 'AI 완성',
      color: 'sky',
      tourClass: 'tour-target-nav-coverletter',
      icon: (active: boolean) => (
        <FileText size={19} className={active ? (isLightMode ? 'text-sky-700' : 'text-sky-300') : (isLightMode ? 'text-sky-600' : 'text-sky-400')} />
      )
    }
  ];

  const secondaryItems = [
    { 
      name: '자격증 가이드', 
      path: '/certificates', 
      tourClass: 'tour-target-nav-cert',
      icon: (active: boolean) => <Award size={20} className={active ? (isLightMode ? 'text-amber-600' : 'text-amber-400') : ''} /> 
    },
    { 
      name: '나만의 기업찾기', 
      path: '/company-search', 
      tourClass: 'tour-target-nav-company',
      icon: (active: boolean) => <Briefcase size={20} className={active ? (isLightMode ? 'text-teal-600' : 'text-teal-400') : ''} /> 
    }
  ];

  return (
    <aside 
      className={`fixed z-[100] transition-all duration-300 ease-in-out flex ${
        isDarkTheme 
          ? 'bg-slate-950/80 sm:bg-slate-950/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-white/10 text-white shadow-[0_-5px_25px_rgba(0,0,0,0.3)] sm:shadow-[0_0_25px_rgba(0,0,0,0.3)]' 
          : 'bg-white/80 sm:bg-white/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-slate-200/60 text-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] sm:shadow-[0_0_20px_rgba(0,0,0,0.03)]'
      } bottom-0 left-0 w-full h-[72px] flex-row sm:flex-col sm:bottom-auto sm:top-0 sm:h-full ${isHovered ? 'sm:w-64' : 'sm:w-14'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`hidden sm:flex h-[72px] items-center px-3.5 overflow-hidden whitespace-nowrap shrink-0 border-b ${
        isDarkTheme ? 'border-white/10' : 'border-slate-200'
      }`}>
        {isHovered ? (
          <a 
            href="/" 
            onClick={handleLogoClick}
            className={`${isDarkTheme ? 'text-white hover:text-teal-300' : 'text-slate-900 hover:text-teal-600'} font-black text-[24px] tracking-[-0.06em] cursor-pointer flex items-center gap-2 leading-none pl-1 group select-none transition-all duration-300 hover:scale-105`}
          >
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isLightMode ? 'text-teal-600' : 'text-teal-400'} shrink-0 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out`}>
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
            </svg>
            <span className="transition-colors duration-300">Mystair</span>
          </a>
        ) : (
          <a 
            href="/" 
            onClick={handleLogoClick}
            className={`${isDarkTheme ? 'text-white' : 'text-slate-900'} cursor-pointer flex items-center justify-center w-7 leading-none group select-none transition-all duration-300 hover:scale-110`}
          >
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isLightMode ? 'text-teal-600' : 'text-teal-400'} group-hover:rotate-180 transition-transform duration-500 ease-out`}>
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
            </svg>
          </a>
        )}
      </div>
      
      <nav className="flex-1 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden flex sm:flex-col items-center sm:items-stretch justify-around sm:justify-start gap-1 sm:gap-1.5 px-2 py-0 sm:py-3 scrollbar-hide">
        {/* 1. Home Item */}
        <Link 
          to="/" 
          title={t('MyStair AI')}
          className={`flex sm:items-center gap-3.5 px-2.5 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] justify-center sm:justify-start flex-col sm:flex-row flex-1 sm:flex-none tour-target-nav-home ${
            location.pathname === '/' 
              ? (isDarkTheme ? 'text-teal-300 sm:bg-white/15 sm:text-white font-bold sm:shadow-xs' : 'text-teal-700 sm:bg-slate-100 sm:text-slate-900 font-bold sm:shadow-xs')
              : (isDarkTheme ? 'text-white/60 hover:text-white sm:text-white/70 sm:hover:bg-white/10 font-medium' : 'text-slate-500 hover:text-slate-800 sm:text-slate-600 sm:hover:bg-slate-50 font-medium')
          }`}
        >
          <div className="shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg">
            <Sparkles size={20} className={isLightMode ? "text-teal-600" : "text-teal-400"} />
          </div>
          <span className={`text-[10px] sm:text-[14px] mt-1 sm:mt-0 transition-opacity duration-300 sm:block ${isHovered ? 'sm:opacity-100' : 'sm:opacity-0'}`}>
            {t('MyStair AI')}
          </span>
        </Link>

        {/* Separator / Core Section Label */}
        {isHovered ? (
          <div className="hidden sm:flex items-center justify-between px-2 pt-2.5 pb-1 animate-in fade-in duration-200">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={11} className="text-emerald-500 animate-pulse" />
              {t('핵심 취업 솔루션', 'Core Solutions')}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-800">
              CORE
            </span>
          </div>
        ) : (
          <div className="hidden sm:block w-5 h-[1px] bg-slate-200 dark:bg-white/10 mx-auto my-1" />
        )}

        {/* 2. Core 3 items (Growth Diary, Mock Interview, Cover Letter) */}
        {coreItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          // Color-specific highlight classes
          const activeClass = item.color === 'emerald'
            ? (isDarkTheme 
                ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 text-emerald-200 font-bold border-l-4 border-l-emerald-400 border-y border-r border-emerald-800/80 shadow-xs' 
                : 'bg-gradient-to-r from-emerald-50 to-white text-emerald-950 font-bold border-l-4 border-l-emerald-500 border-y border-r border-emerald-200/90 shadow-xs ring-1 ring-emerald-400/20')
            : item.color === 'indigo'
            ? (isDarkTheme 
                ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 text-indigo-200 font-bold border-l-4 border-l-indigo-400 border-y border-r border-indigo-800/80 shadow-xs' 
                : 'bg-gradient-to-r from-indigo-50 to-white text-indigo-950 font-bold border-l-4 border-l-indigo-500 border-y border-r border-indigo-200/90 shadow-xs ring-1 ring-indigo-400/20')
            : (isDarkTheme 
                ? 'bg-gradient-to-r from-sky-950/60 to-slate-900 text-sky-200 font-bold border-l-4 border-l-sky-400 border-y border-r border-sky-800/80 shadow-xs' 
                : 'bg-gradient-to-r from-sky-50 to-white text-sky-950 font-bold border-l-4 border-l-sky-500 border-y border-r border-sky-200/90 shadow-xs ring-1 ring-sky-400/20');

          const inactiveClass = item.color === 'emerald'
            ? (isDarkTheme 
                ? 'text-white/80 hover:text-white hover:bg-emerald-950/30 font-medium' 
                : 'text-slate-800 hover:text-slate-950 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200/50 font-semibold')
            : item.color === 'indigo'
            ? (isDarkTheme 
                ? 'text-white/80 hover:text-white hover:bg-indigo-950/30 font-medium' 
                : 'text-slate-800 hover:text-slate-950 hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200/50 font-semibold')
            : (isDarkTheme 
                ? 'text-white/80 hover:text-white hover:bg-sky-950/30 font-medium' 
                : 'text-slate-800 hover:text-slate-950 hover:bg-sky-50/70 border border-transparent hover:border-sky-200/50 font-semibold');

          // Icon tile background
          const iconTileBg = item.color === 'emerald'
            ? (isDarkTheme ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-100/80 border-emerald-200/90')
            : item.color === 'indigo'
            ? (isDarkTheme ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-indigo-100/80 border-indigo-200/90')
            : (isDarkTheme ? 'bg-sky-500/20 border-sky-500/30' : 'bg-sky-100/80 border-sky-200/90');

          return (
            <Link 
              key={item.name} 
              to={item.path} 
              title={t(item.name)}
              className={`group flex sm:items-center gap-3 px-2 sm:px-2.5 py-1.5 sm:py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[46px] justify-center sm:justify-start flex-col sm:flex-row flex-1 sm:flex-none ${item.tourClass} ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              {/* Highlighted Icon Tile */}
              <div className={`shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg border transition-transform group-hover:scale-105 shadow-2xs ${iconTileBg}`}>
                {item.icon(isActive)}
              </div>

              {/* Label & Core Badge */}
              <div className={`hidden sm:flex items-center justify-between flex-1 overflow-hidden transition-opacity duration-300 ${isHovered ? 'sm:opacity-100' : 'sm:opacity-0'}`}>
                <span className="text-[13.5px] truncate font-bold">
                  {t(item.name)}
                </span>
                
                {/* Visual badge */}
                <span className={`ml-1.5 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${
                  item.color === 'emerald' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                    : item.color === 'indigo'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300/80 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                    : 'bg-sky-100 text-sky-800 border-sky-300/80 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                }`}>
                  {t(item.badge)}
                </span>
              </div>

              {/* Mobile text fallback */}
              <span className="text-[10px] mt-0.5 sm:hidden font-bold truncate">
                {t(item.name)}
              </span>
            </Link>
          );
        })}

        {/* Separator / Explore Section Label */}
        {isHovered ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 pt-3 pb-1 border-t border-slate-200/70 dark:border-white/10 mt-1 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('탐색 & 지원', 'Explore')}
            </span>
          </div>
        ) : (
          <div className="hidden sm:block w-5 h-[1px] bg-slate-200 dark:bg-white/10 mx-auto my-1" />
        )}

        {/* 3. Secondary Items (Certificates, Company Search) */}
        {secondaryItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link 
              key={item.name} 
              to={item.path} 
              title={t(item.name)}
              className={`flex sm:items-center gap-3.5 px-2.5 py-1.5 sm:py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] justify-center sm:justify-start flex-col sm:flex-row flex-1 sm:flex-none ${item.tourClass} ${
                isActive 
                  ? (isDarkTheme ? 'text-teal-300 sm:bg-white/15 sm:text-white font-bold sm:shadow-xs' : 'text-teal-700 sm:bg-slate-100 sm:text-slate-900 font-bold sm:shadow-xs')
                  : (isDarkTheme ? 'text-white/60 hover:text-white sm:text-white/70 sm:hover:bg-white/10 font-medium' : 'text-slate-500 hover:text-slate-800 sm:text-slate-600 sm:hover:bg-slate-50 font-medium')
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg">
                {item.icon(isActive)}
              </div>
              <span className={`text-[10px] sm:text-[13.5px] mt-1 sm:mt-0 transition-opacity duration-300 sm:block ${isHovered ? 'sm:opacity-100' : 'sm:opacity-0'}`}>
                {t(item.name)}
              </span>
            </Link>
          );
        })}

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

      {/* Desktop Profile Section */}
      <div className={`hidden sm:flex shrink-0 px-3 py-3 border-t ${isDarkTheme ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex items-center justify-between whitespace-nowrap">
          <Link 
            to="/mypage" 
            title={t('마이페이지 겸 설정', 'My Page & Settings')}
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 tour-target-nav-mypage-desktop"
          >
            {userProfile?.avatarUrl || user?.photoURL ? (
              <img 
                src={userProfile?.avatarUrl || user?.photoURL || ''} 
                alt={t('프로필')} 
                className="w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full object-cover shrink-0 transition-all group-hover:scale-105 shadow-sm"
              />
            ) : (
              <div className={`w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full flex items-center justify-center shrink-0 transition-all group-hover:scale-105 ${
                isLightMode ? 'bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white shadow-sm' : 'bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white shadow-sm'
              }`}>
                <User size={14} className="shrink-0" />
              </div>
            )}
            <div className={`flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden min-w-0`}>
              <span className={`text-[13px] font-bold leading-tight truncate group-hover:text-teal-400 transition-colors ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                {displayName}
              </span>
              <span className={`text-[11px] truncate font-medium ${isDarkTheme ? 'text-teal-300' : 'text-teal-600'}`}>
                {t('마이페이지 겸 설정', 'My Page & Settings')}
              </span>
            </div>
          </Link>

          {isHovered && (
            <div className="flex items-center gap-1 shrink-0 ml-1">
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
          )}
        </div>
      </div>
    </aside>
  );
}
