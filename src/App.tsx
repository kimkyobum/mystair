import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './friend_site/LanguageContext';
import MarketingApp from './friend_site/App';
import AppWrapper from './AppWrapper';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const [viewingPromo, setViewingPromo] = useState(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) return true;
    return sessionStorage.getItem('viewingPromo') === 'true';
  });

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('viewingPromo', 'false');
    setIsLoggedIn(true);
    setViewingPromo(false);
  };

  const handleReturnToMainApp = () => {
    sessionStorage.setItem('viewingPromo', 'false');
    setViewingPromo(false);
  };

  const handleLogoutOtherAccount = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('viewingPromo');
    setIsLoggedIn(false);
    setViewingPromo(true);
  };

  const showMarketing = !isLoggedIn || viewingPromo;

  return (
    <LanguageProvider>
      {showMarketing ? (
        <MarketingApp 
          onLoginSuccess={handleLoginSuccess} 
          isLoggedIn={isLoggedIn}
          onReturnToMainApp={handleReturnToMainApp}
          onLogoutOtherAccount={handleLogoutOtherAccount}
        />
      ) : (
        <AuthProvider>
          <ChatProvider>
            <ThemeProvider>
              <AppWrapper />
            </ThemeProvider>
          </ChatProvider>
        </AuthProvider>
      )}
    </LanguageProvider>
  );
}



