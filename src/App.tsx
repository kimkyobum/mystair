import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './friend_site/LanguageContext';
import MarketingApp from './friend_site/App';
import AppWrapper from './AppWrapper';

export default function App() {
  // Always reset to the landing/promotional homepage on refresh or initial load
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewingPromo, setViewingPromo] = useState(true);

  useEffect(() => {
    // Clear any previous session state so refreshing always exits to the promo homepage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('viewingPromo');
  }, []);

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
      <ThemeProvider>
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
              <AppWrapper />
            </ChatProvider>
          </AuthProvider>
        )}
      </ThemeProvider>
    </LanguageProvider>
  );
}



