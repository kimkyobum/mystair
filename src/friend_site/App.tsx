import { useState } from 'react';
import SplineBackground from './SplineBackground';
import Starfield from './Starfield';
import LightBackground from '../components/LightBackground';
import Dashboard from './Dashboard';
import Login from './Login';
import { useLanguage } from './LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface MarketingAppProps {
  onLoginSuccess?: () => void;
  isLoggedIn?: boolean;
  onReturnToMainApp?: () => void;
  onLogoutOtherAccount?: () => void;
}

export default function App({ 
  onLoginSuccess, 
  isLoggedIn = false, 
  onReturnToMainApp, 
  onLogoutOtherAccount 
}: MarketingAppProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'login'>('home');
  const { language, setLanguage, t } = useLanguage();
  const { isLightMode, setIsLightMode } = useTheme();

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('home')} onLoginSuccess={onLoginSuccess} />;
  }

  const handleLoginClick = () => {
    if (isLoggedIn) {
      if (onLogoutOtherAccount) {
        onLogoutOtherAccount();
      }
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <div className={`relative min-h-screen ${
      isLightMode 
        ? 'bg-slate-50 text-slate-900 selection:bg-teal-500/20' 
        : 'bg-black text-white selection:bg-blue-500/30'
    } font-sans transition-colors duration-300`}>
      
      {/* Dynamic Background */}
      {isLightMode ? (
        <LightBackground />
      ) : (
        <>
          <SplineBackground />
          <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen">
            <Starfield />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          </div>
        </>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2.5 sm:px-6 md:px-10 py-2.5 sm:py-4 backdrop-blur-md border-b transition-colors duration-300 w-full max-w-full box-border overflow-x-hidden ${
        isLightMode 
          ? 'bg-white/80 border-slate-200/80 text-slate-900 shadow-xs' 
          : 'bg-black/50 border-white/10 text-white'
      }`}>
        <div className="text-lg sm:text-2xl font-extrabold tracking-tighter flex items-center gap-1.5 sm:gap-2 group cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 shrink-0">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[28px] sm:h-[28px] shrink-0">
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
          </svg>
          <span className={`font-black tracking-[-0.04em] transition-colors duration-300 shrink-0 ${
            isLightMode
              ? 'text-slate-900 group-hover:text-teal-600'
              : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 group-hover:text-teal-300'
          }`}>
            Mystair
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-6 text-sm font-semibold transition-colors ${
          isLightMode ? 'text-slate-600' : 'text-gray-300'
        }`}>
          <a href="/map.html" target="_blank" rel="noopener noreferrer" className={`transition-colors whitespace-nowrap ${
            isLightMode ? 'hover:text-slate-950' : 'hover:text-white'
          }`}>{t('nav.map')}</a>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {/* Quick Language Toggle Buttons */}
          <div className={`flex items-center border rounded-full p-0.5 text-[10px] sm:text-xs shrink-0 ${
            isLightMode ? 'bg-slate-100/90 border-slate-300/80' : 'bg-white/5 border-white/10'
          }`}>
            <button 
              onClick={() => setLanguage('ko')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'ko' 
                  ? isLightMode 
                    ? 'bg-teal-400 text-slate-950 shadow-xs' 
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/20' 
                  : isLightMode 
                    ? 'text-slate-600 hover:text-slate-950' 
                    : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">한국어</span>
              <span className="inline sm:hidden">한</span>
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'en' 
                  ? isLightMode 
                    ? 'bg-teal-400 text-slate-950 shadow-xs' 
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/20' 
                  : isLightMode 
                    ? 'text-slate-600 hover:text-slate-950' 
                    : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">English</span>
              <span className="inline sm:hidden">EN</span>
            </button>
          </div>

          {/* Theme Toggle Button (White / Space Mode) */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            title={isLightMode ? t('우주(다크) 모드로 전환', 'Switch to Space Mode') : t('화이트(라이트) 모드로 전환', 'Switch to White Mode')}
            aria-label={isLightMode ? t('우주 모드로 전환', 'Switch to Space Mode') : t('화이트 모드로 전환', 'Switch to White Mode')}
            className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center active:scale-95 shrink-0 ${
              isLightMode
                ? 'bg-white/80 hover:bg-white border-slate-300/80 text-amber-500 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-teal-300'
            }`}
          >
            {isLightMode ? (
              <Sun size={16} className="text-amber-500 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={16} className="text-teal-300 transition-transform hover:-rotate-12" />
            )}
          </button>
          
          <button 
            onClick={handleLoginClick}
            className={`px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 word-keep active:scale-95 ${
              isLoggedIn 
                ? isLightMode
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25'
                : isLightMode
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isLoggedIn ? (
              <>
                <span className="hidden sm:inline">{t('다른 계정으로 로그인하기', 'Login with another account')}</span>
                <span className="inline sm:hidden">{t('계정 변경', 'Switch')}</span>
              </>
            ) : (
              t('nav.login')
            )}
          </button>
        </div>
      </nav>
      
      {/* The Dashboard content acts as an interactive overlay with glassmorphism */}
      <div className="relative z-10 pt-16 pointer-events-none">
        <Dashboard onNavigateToLogin={isLoggedIn ? onReturnToMainApp : () => setCurrentPage('login')} />
      </div>
    </div>
  );
}
