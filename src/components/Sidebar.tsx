import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Briefcase, 
  Brain, 
  Compass, 
  User,
  LogOut,
  LogIn,
  Sparkles,
  Users
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
  
  const isDarkTheme = !isLightMode && (location.pathname === '/' || location.pathname === '/diary' || location.pathname === '/mypage' || location.pathname === '/profile' || location.pathname === '/mbti' || location.pathname === '/holland' || location.pathname === '/certificates' || location.pathname === '/company-search');

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

  const navItems = [
    { name: 'MyStair AI', path: '/', icon: <Sparkles size={22} className={isLightMode ? "text-teal-600" : "text-teal-400"} /> },
    { name: '성장다이어리', path: '/diary', icon: <BookOpen size={22} /> },
    { name: '자격증 가이드', path: '/certificates', icon: <Award size={22} /> },
    { name: '나만의 기업찾기', path: '/company-search', icon: <Briefcase size={22} /> },
    { name: 'MBTI검사', path: '/mbti', icon: <Brain size={22} /> },
    { name: '홀랜드 진로적성 검사', path: '/holland', icon: <Compass size={22} /> }
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
      
      <nav className="flex-1 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden flex sm:flex-col items-center sm:items-stretch justify-around sm:justify-start gap-1 sm:gap-1.5 px-2 py-0 sm:py-4 scrollbar-hide">
        {navItems.map((item, index) => {
          const isActive = (item.path === '/' && index === 0 && location.pathname === '/') || 
                           (item.path !== '/' && location.pathname === item.path);

          return (
            <Link 
              key={index} 
              to={item.path} 
              title={t(item.name)}
              className={`flex sm:items-center gap-3.5 px-2.5 py-2 sm:py-3 rounded-xl transition-colors whitespace-nowrap min-h-[48px] justify-center sm:justify-start flex-col sm:flex-row flex-1 sm:flex-none ${
                isActive 
                  ? (isDarkTheme ? 'text-indigo-300 sm:bg-white/15 sm:text-white font-semibold sm:shadow-sm' : 'text-indigo-700 sm:bg-slate-100 sm:text-slate-900 font-bold sm:shadow-sm')
                  : (isDarkTheme ? 'text-white/50 hover:text-white sm:text-white/70 sm:hover:bg-white/10 font-medium' : 'text-slate-400 hover:text-slate-800 sm:text-slate-600 sm:hover:bg-slate-50 font-medium')
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6 sm:w-5 sm:h-5">
                {item.icon}
              </div>
              <span className={`text-[10px] sm:text-[14px] mt-1 sm:mt-0 transition-opacity duration-300 sm:block ${isHovered ? 'sm:opacity-100' : 'sm:opacity-0'}`}>
                {t(item.name)}
              </span>
            </Link>
          );
        })}
        {/* Mobile MyPage icon */}
        <Link 
          to="/mypage" 
          title={t('마이페이지 겸 설정')}
          className={`flex sm:hidden flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-colors min-h-[48px] ${
            location.pathname === '/mypage' 
              ? (isDarkTheme ? 'text-indigo-300 font-semibold' : 'text-indigo-700 font-bold')
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
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
          >
            {userProfile?.avatarUrl || user?.photoURL ? (
              <img 
                src={userProfile?.avatarUrl || user?.photoURL || ''} 
                alt={t('프로필')} 
                className="w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full object-cover shrink-0 transition-all group-hover:scale-105 shadow-sm"
              />
            ) : (
              <div className={`w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full flex items-center justify-center shrink-0 transition-all group-hover:scale-105 ${
                isLightMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm'
              }`}>
                <User size={14} className="shrink-0" />
              </div>
            )}
            <div className={`flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden min-w-0`}>
              <span className={`text-[13px] font-bold leading-tight truncate group-hover:text-indigo-500 transition-colors ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                {displayName}
              </span>
              <span className={`text-[11px] truncate font-medium ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-600'}`}>
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
                    isDarkTheme ? 'hover:bg-white/10 text-indigo-300 hover:text-white' : 'hover:bg-slate-200 text-indigo-600 hover:text-indigo-800'
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
