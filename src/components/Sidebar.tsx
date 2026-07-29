import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Briefcase, 
  Brain, 
  Compass, 
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const { user, userProfile, logout, loginWithGoogle } = useAuth();

  const location = useLocation();
  const isDarkTheme = location.pathname === '/';

  const displayName = userProfile?.name || user?.displayName || '게스트';

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout();
  };

  const navItems = [
    { name: '성장다이어리', path: '/diary', icon: <BookOpen size={20} /> },
    { name: '자격증 가이드', path: '/certificates', icon: <Award size={20} /> },
    { name: '채용 인사이트', path: '/', icon: <Briefcase size={20} /> },
    { name: 'MBTI검사', path: '/mbti', icon: <Brain size={20} /> },
    { name: '홀랜드 진로적성 검사', path: '/holland', icon: <Compass size={20} /> }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-full z-[100] transition-all duration-300 ease-in-out flex flex-col ${
        isDarkTheme 
          ? 'bg-black/20 backdrop-blur-md border-r border-white/10 text-white shadow-[0_0_25px_rgba(0,0,0,0.5)]' 
          : 'bg-white border-r border-slate-200 text-slate-800 shadow-[0_0_25px_rgba(0,0,0,0.08)]'
      } ${isHovered ? 'w-64' : 'w-14'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-[72px] flex items-center px-3.5 overflow-hidden whitespace-nowrap shrink-0 border-b ${
        isDarkTheme ? 'border-white/10' : 'border-slate-200'
      }`}>
        {isHovered ? (
          <Link to="/" className={`${isDarkTheme ? 'text-white' : 'text-slate-900'} font-black text-[24px] tracking-[-0.06em] cursor-pointer flex items-center leading-none pl-1`}>
            Mystair
          </Link>
        ) : (
          <Link to="/" className={`${isDarkTheme ? 'text-white' : 'text-slate-900'} font-black text-[20px] tracking-[-0.06em] cursor-pointer flex items-center justify-center w-7 leading-none`}>
            M
          </Link>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-1.5 px-2">
        {navItems.map((item, index) => {
          const isActive = (location.pathname === item.path && item.path !== '/') || (item.path === '/' && location.pathname === '/' && index === 0);
          
          return (
            <Link 
              key={index} 
              to={item.path} 
              className={`flex items-center gap-3.5 px-2.5 py-3 rounded-xl transition-colors whitespace-nowrap ${
                isActive 
                  ? (isDarkTheme ? 'bg-white/15 text-white font-semibold shadow-sm' : 'bg-slate-100 text-slate-900 font-bold shadow-sm')
                  : (isDarkTheme ? 'text-white/70 hover:bg-white/10 hover:text-white font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium')
              }`}
            >
              <div className="shrink-0 flex items-center justify-center w-5 h-5">
                {item.icon}
              </div>
              <span className={`text-[14px] transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={`shrink-0 px-3 py-3 border-t ${isDarkTheme ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex items-center justify-between whitespace-nowrap">
          <Link 
            to="/mypage" 
            title="마이페이지로 이동"
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
          >
            <div className={`w-7 h-7 min-w-[28px] min-h-[28px] aspect-square rounded-full flex items-center justify-center shrink-0 transition-all group-hover:scale-105 ${
              isDarkTheme 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm' 
                : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-sm'
            }`}>
              <User size={14} className="shrink-0" />
            </div>
            <div className={`flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden min-w-0`}>
              <span className={`text-[13px] font-bold leading-tight truncate group-hover:text-indigo-400 transition-colors ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                {displayName}
              </span>
              <span className={`text-[11px] truncate font-medium ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-600'}`}>
                마이페이지
              </span>
            </div>
          </Link>

          {isHovered && user && (
            <button 
              onClick={handleLogout}
              title="로그아웃"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 ${
                isDarkTheme ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogOut size={14} />
            </button>
          )}

          {isHovered && !user && (
            <button 
              onClick={() => loginWithGoogle()}
              title="구글 로그인"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 ${
                isDarkTheme ? 'hover:bg-white/10 text-indigo-300 hover:text-white' : 'hover:bg-slate-200 text-indigo-600 hover:text-indigo-800'
              }`}
            >
              <LogIn size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

