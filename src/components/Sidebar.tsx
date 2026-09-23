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
        className={`group flex items-center transition-all whitespace-nowrap ${item.tourClass || ''} ${
          // Mobile layout
          'flex-col justify-center gap-1 py-1.5 px-2 flex-1 sm:flex-none'
        } ${
          // Desktop layout: full width when hovered, perfectly centered 40x40 square when collapsed
          isHovered 
            ? 'sm:flex-row sm:w-full sm:px-3 sm:py-2.5 sm:justify-start sm:gap-3 sm:rounded-xl min-h-[42px]' 
            : 'sm:flex-row sm:w-10 sm:h-10 sm:p-0 sm:px-0 sm:mx-auto sm:justify-center sm:items-center sm:self-center sm:gap-0 sm:rounded-xl'
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
        <div className="shrink-0 flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5">
          <Icon 
            size={20} 
            className={`transition-colors duration-150 ${
              isActive 
                ? (isLightMode ? 'text-emerald-600' : 'text-teal-300') 
                : (isLightMode ? 'text-slate-600 group-hover:text-slate-900' : 'text-white/70 group-hover:text-white')
            }`} 
          />
        </div>

        {/* Desktop text: only shown when sidebar is expanded on hover */}
        {isHovered && (
          <span className="hidden sm:inline-block text-[13.5px] truncate font-semibold animate-in fade-in duration-150">
            {t(item.name)}
          </span>
        )}

        {/* Mobile text label */}
        <span className="text-[10px] sm:hidden font-medium truncate max-w-[56px]">
          {t(item.name)}
        </span>
      </Link>
    );
  };

  return (
    <aside 
      className={`fixed z-[100] transition-all duration-300 ease-in-out flex ${
        isDarkTheme 
          ? 'bg-slate-950/80 sm:bg-slate-950/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-white/10 text-white shadow-[0_-5px_25px_rgba(0,0,0,0.3)] sm:shadow-[0_0_25px_rgba(0,0,0,0.3)]' 
          : 'bg-white/80 sm:bg-white/50 backdrop-blur-xl border-t sm:border-t-0 sm:border-r border-slate-200/60 text-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] sm:shadow-[0_0_20px_rgba(0,0,0,0.03)]'
      } bottom-0 left-0 w-full h-[72px] flex-row sm:flex-col sm:bottom-auto sm:top-0 sm:h-full ${isHovered ? 'sm:w-64' : 'sm:w-16'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`hidden sm:flex h-[72px] items-center overflow-hidden whitespace-nowrap shrink-0 border-b ${
        isHovered ? 'px-3.5 justify-start' : 'px-0 justify-center w-full'
      } ${
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
            className={`${isDarkTheme ? 'text-white' : 'text-slate-900'} cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl leading-none group select-none transition-all duration-300 hover:scale-110`}
          >
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isLightMode ? 'text-teal-600' : 'text-teal-400'} group-hover:rotate-180 transition-transform duration-500 ease-out`}>
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
            </svg>
          </a>
        )}
      </div>
      
      <nav className={`flex-1 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden flex sm:flex-col justify-around sm:justify-start gap-1 scrollbar-hide py-0 sm:py-3 ${
        isHovered ? 'sm:px-3 sm:items-stretch' : 'sm:px-0 sm:items-center'
      } px-2`}>
        {/* 1. Main Navigation (Home, 성장다이어리, 모의면접, 자소서) */}
        <div className={`flex sm:flex-col gap-1 w-full ${isHovered ? 'sm:items-stretch' : 'sm:items-center'}`}>
          {mainItems.map(renderNavItem)}
        </div>

        {/* Divider & Section 2 Label: 탐색 & 지원 */}
        {isHovered ? (
          <div className="hidden sm:block pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none animate-in fade-in duration-150">
            {t('탐색 & 지원')}
          </div>
        ) : (
          <div className="hidden sm:block w-7 h-[1px] bg-slate-200 dark:bg-white/10 mx-auto my-1.5 self-center shrink-0" />
        )}

        {/* 2. 탐색 & 지원 (자격증 가이드, 기업찾기) */}
        <div className={`flex sm:flex-col gap-1 w-full ${isHovered ? 'sm:items-stretch' : 'sm:items-center'}`}>
          {exploreItems.map(renderNavItem)}
        </div>

        {/* Divider & Section 3 Label: 검사 */}
        {isHovered ? (
          <div className="hidden sm:block pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none animate-in fade-in duration-150">
            {t('검사')}
          </div>
        ) : (
          <div className="hidden sm:block w-7 h-[1px] bg-slate-200 dark:bg-white/10 mx-auto my-1.5 self-center shrink-0" />
        )}

        {/* 3. 검사 (MBTI, 홀랜드) */}
        <div className={`flex sm:flex-col gap-1 w-full ${isHovered ? 'sm:items-stretch' : 'sm:items-center'}`}>
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

      {/* Desktop Profile Section */}
      <div className={`hidden sm:flex shrink-0 py-3 border-t ${isHovered ? 'px-3' : 'px-0 justify-center'} ${isDarkTheme ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className={`flex items-center whitespace-nowrap ${isHovered ? 'justify-between w-full' : 'justify-center'}`}>
          <Link 
            to="/mypage" 
            title={t('마이페이지 겸 설정', 'My Page & Settings')}
            className={`flex items-center gap-3 cursor-pointer group tour-target-nav-mypage-desktop ${isHovered ? 'flex-1 min-w-0' : 'justify-center'}`}
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
