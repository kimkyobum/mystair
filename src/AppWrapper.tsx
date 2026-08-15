import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Starfield from './components/Starfield';
import LightBackground from './components/LightBackground';
import ClickEffect from './components/ClickEffect';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Certificates from './pages/Certificates';
import MBTI from './pages/MBTI';
import Holland from './pages/Holland';
import MyPage from './pages/MyPage';
import Diary from './pages/Diary';
import CompanySearch from './pages/CompanySearch';
import Creators from './pages/Creators';
import { useTheme } from './context/ThemeContext';

export default function AppWrapper() {
  const { isLightMode, backgroundType } = useTheme();

  return (
    <BrowserRouter>
      <div className={`h-[100dvh] ${isLightMode ? 'bg-slate-50 text-slate-900' : (backgroundType === 'black' ? 'bg-black text-white' : 'bg-slate-900 text-white')} font-sans overflow-hidden selection:bg-purple-500/30 flex relative`}>
        <ClickEffect />
        <Sidebar />
        {isLightMode ? <LightBackground /> : (backgroundType === 'black' && <Starfield />)}
        <div className="flex-1 h-full pl-0 pb-[72px] sm:pb-0 sm:pl-14 relative z-10 flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/company-search" element={<CompanySearch />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/mbti" element={<MBTI />} />
            <Route path="/holland" element={<Holland />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/profile" element={<MyPage />} />
            <Route path="/creators" element={<Creators />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
