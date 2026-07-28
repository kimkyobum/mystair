import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Briefcase, 
  Brain, 
  Compass, 
  Building2,
  User,
  LogOut
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
}

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '내 프로필',
    email: 'guest@mystair.com'
  });

  const location = useLocation();
  const navigate = useNavigate();
  const isDarkTheme = location.pathname === '/';

  useEffect(() => {
    // 1. Check URL query parameters (e.g., ?email=...&name=...)
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const nameParam = params.get('name');

    if (emailParam || nameParam) {
      const newProfile: UserProfile = {
        name: nameParam || emailParam?.split('@')[0] || '회원',
        email: emailParam || 'user@mystair.com'
      };
      setUserProfile(newProfile);
      localStorage.setItem('mystair_user_profile', JSON.stringify(newProfile));

      // Clean up search parameters from URL for clean view
      params.delete('email');
      params.delete('name');
      const newSearch = params.toString();
      navigate({
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : ''
      }, { replace: true });
      return;
    }

    // 2. Load from localStorage if available
    const saved = localStorage.getItem('mystair_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          setUserProfile(parsed);
        }
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
  }, [location.search, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mystair_user_profile');
    setUserProfile({
      name: '내 프로필',
      email: 'guest@mystair.com'
    });
  };

  const navItems = [
    { name: '성장다이어리', path: '/', icon: <BookOpen size={20} /> },
    { name: '자격증 가이드', path: '/certificates', icon: <Award size={20} /> },
    { name: '채용 인사이트', path: '/', icon: <Briefcase size={20} /> },
    { name: 'MBTI검사', path: '/mbti', icon: <Brain size={20} /> },
    { name: '홀랜드 진로적성 검사', path: '/holland', icon: <Compass size={20} /> },
    { name: '나만의 기업찾기', path: '/', icon: <Building2 size={20} /> }
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

      <div className={`shrink-0 p-3.5 border-t ${isDarkTheme ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex items-center justify-between whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDarkTheme ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
              <User size={15} />
            </div>
            <div className={`flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
              <span className={`text-[13px] font-semibold leading-tight truncate ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                {userProfile.name}
              </span>
              <span className={`text-[11px] truncate ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                {userProfile.email}
              </span>
            </div>
          </div>

          {isHovered && userProfile.email !== 'guest@mystair.com' && (
            <button 
              onClick={handleLogout}
              title="로그아웃"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isDarkTheme ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
