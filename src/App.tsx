import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LanguageProvider } from './friend_site/LanguageContext';
import MarketingApp from './friend_site/App';
import Starfield from './components/Starfield';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Certificates from './pages/Certificates';
import MBTI from './pages/MBTI';
import Holland from './pages/Holland';
import MyPage from './pages/MyPage';
import Diary from './pages/Diary';

export default function App() {
  const [showMainApp, setShowMainApp] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setShowMainApp(true);
  };

  if (!showMainApp) {
    return (
      <LanguageProvider>
        <MarketingApp onLoginSuccess={handleLoginSuccess} />
      </LanguageProvider>
    );
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <div className="h-screen bg-black text-white font-sans overflow-hidden selection:bg-purple-500/30 flex relative">
            <Sidebar />
            <Starfield />
            <div className="flex-1 h-full pl-14 relative flex flex-col min-w-0 overflow-hidden">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/mbti" element={<MBTI />} />
                <Route path="/holland" element={<Holland />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/profile" element={<MyPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}



