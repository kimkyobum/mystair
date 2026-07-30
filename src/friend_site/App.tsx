import { useState } from 'react';
import SplineBackground from './SplineBackground';
import Starfield from './Starfield';
import Dashboard from './Dashboard';
import Login from './Login';
import { useLanguage } from './LanguageContext';

export default function App({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [currentPage, setCurrentPage] = useState<'home' | 'login'>('home');
  const { language, setLanguage, t } = useLanguage();

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('home')} onLoginSuccess={onLoginSuccess} />;
  }

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      
      <SplineBackground />
      
      {/* Global Fixed Background */}
      <div className="fixed inset-0 z-10 pointer-events-none mix-blend-screen">
        <Starfield />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="text-2xl font-extrabold tracking-tighter flex items-center gap-2 group cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out">
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
            <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
          </svg>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 group-hover:text-teal-300 transition-colors duration-300">
            Mystair
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="/map.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('nav.map')}</a>
          <a href="/creators.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('nav.creators')}</a>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-white border border-white/20 rounded-full px-3 py-1.5 text-sm font-medium outline-none hover:bg-white/5 transition-colors focus:border-teal-400 appearance-none cursor-pointer"
            style={{ WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23ffffff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em', paddingRight: '2rem' }}
          >
            <option value="ko" className="bg-gray-900 text-white">한국어</option>
            <option value="en" className="bg-gray-900 text-white">English</option>
          </select>
          <button 
            onClick={() => setCurrentPage('login')}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            {t('nav.login')}
          </button>
        </div>
      </nav>
      
      {/* The Dashboard content acts as an interactive overlay with glassmorphism */}
      <div className="relative z-10 pt-16 pointer-events-none">
        <Dashboard onNavigateToLogin={() => setCurrentPage('login')} />
      </div>
    </div>
  );
}
