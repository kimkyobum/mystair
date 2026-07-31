import { useState } from 'react';
import SplineBackground from './SplineBackground';
import Starfield from './Starfield';
import Dashboard from './Dashboard';
import Login from './Login';
import { useLanguage } from './LanguageContext';

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
    <div className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      
      <SplineBackground />
      
      {/* Global Fixed Background */}
      <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen">
        <Starfield />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2.5 sm:px-6 md:px-10 py-2.5 sm:py-4 bg-black/50 backdrop-blur-md border-b border-white/10 w-full max-w-full box-border overflow-x-hidden">
        <div className="text-lg sm:text-2xl font-extrabold tracking-tighter flex items-center gap-1.5 sm:gap-2 group cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 shrink-0">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[28px] sm:h-[28px] shrink-0">
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
          </svg>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 group-hover:text-teal-300 transition-colors duration-300 shrink-0">
            Mystair
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="/map.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors whitespace-nowrap">{t('nav.map')}</a>
          <a href="/creators.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors whitespace-nowrap">{t('nav.creators')}</a>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {/* Quick Language Toggle Buttons */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] sm:text-xs shrink-0">
            <button 
              onClick={() => setLanguage('ko')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'ko' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20' 
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
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">English</span>
              <span className="inline sm:hidden">EN</span>
            </button>
          </div>
          
          <button 
            onClick={handleLoginClick}
            className={`px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 word-keep ${
              isLoggedIn 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25' 
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
