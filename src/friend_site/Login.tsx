import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider
} from '../lib/firebase';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess?: () => void;
}

const generateInitialsAvatar = (name: string) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  // Google avatar material palette: Blue, Red, Yellow, Green, Purple, Teal
  const colors = ['#1a73e8', '#ea4335', '#f9ab00', '#137333', '#a142f4', '#00acc1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50%" y="54%" font-family="'Google Sans', Roboto, Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initial}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function Login({ onBack, onLoginSuccess }: LoginProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'select' | 'email'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup states
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [signupConfirmPasswordError, setSignupConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMockAccountChooser, setShowMockAccountChooser] = useState(false);
  const [customMockEmail, setCustomMockEmail] = useState('');
  const [customMockName, setCustomMockName] = useState('');
  const [showCustomMockInput, setShowCustomMockInput] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

    if (password.length < 8) {
      setPasswordError('비밀번호는 8글자 이상이어야 합니다.');
      return;
    } else if (!/[!@#$%^&*(),.?":{}|<>\-_=+~`'[\]\\]/.test(password)) {
      setPasswordError('특수기호를 반드시 포함해야 합니다.');
      return;
    } else {
      setPasswordError('');
    }

    setServerError('');
    setIsLoading(true);
    const normEmail = email.toLowerCase().trim();

    try {
      let loggedInUser: any = null;

      // 1. Check LocalStorage registered users first (most robust for client/Vercel environments)
      const rawUsers = localStorage.getItem('mystair_registered_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const foundLocalUser = users.find(u => u.email === normEmail);

      if (foundLocalUser) {
        if (foundLocalUser.password === password) {
          loggedInUser = {
            uid: foundLocalUser.uid,
            email: foundLocalUser.email,
            displayName: foundLocalUser.displayName || normEmail.split('@')[0]
          };
        } else {
          setServerError('비밀번호가 올바르지 않습니다.');
          setIsLoading(false);
          return;
        }
      }

      // 2. If not found locally, attempt Backend API call (/api/login)
      if (!loggedInUser) {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normEmail, password })
          });

          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
              loggedInUser = {
                uid: data.uid,
                email: data.email,
                displayName: data.displayName || data.email.split('@')[0],
              };
            } else if (response.status === 400 && data.message) {
              setServerError(data.message);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Backend login request failed:', err);
        }
      }

      // 3. Fallback: Firebase Auth
      if (!loggedInUser) {
        const currentApiKey = auth?.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
        const isDummyKey = !currentApiKey || currentApiKey === "AIzaSyDummyKeyForLocalDevOnly";
        if (!isDummyKey) {
          try {
            const userCred = await signInWithEmailAndPassword(auth, normEmail, password);
            if (userCred.user) {
              loggedInUser = {
                uid: userCred.user.uid,
                email: userCred.user.email || normEmail,
                displayName: userCred.user.displayName || normEmail.split('@')[0]
              };
            }
          } catch (fbErr: any) {
            console.warn('Firebase login failed:', fbErr);
          }
        }
      }

      if (!loggedInUser) {
        setServerError('등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.');
        setIsLoading(false);
        return;
      }

      if (loggedInUser) {
        localStorage.setItem('mystair_mock_user', JSON.stringify(loggedInUser));

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = '/';
        }
      } else {
        setServerError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setServerError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setServerError('');
    setIsLoading(true);
    const currentApiKey = auth?.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
    const isDummyKey = !currentApiKey || currentApiKey === "AIzaSyDummyKeyForLocalDevOnly";
    
    if (isDummyKey) {
      console.warn('Using graceful mock Google login since real Firebase credentials are not provided.');
      setShowMockAccountChooser(true);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const name = user.displayName || user.email?.split('@')[0] || '사용자';
      const avatarUrl = user.photoURL || generateInitialsAvatar(name);
      
      const profile = {
        uid: user.uid,
        name: name,
        email: user.email || '',
        avatarUrl: avatarUrl,
        highSchool: '서울마이스터고등학교',
        major: '전기전자과',
        mbti: 'ENTJ',
        hollandCode: 'RIC',
        targetCompanies: ['한국전력공사', '삼성전자']
      };
      localStorage.setItem('mystair_local_user_profile', JSON.stringify(profile));
      
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (
        error?.message?.includes('api-key-not-valid') || 
        error?.code?.includes('api-key-not-valid') || 
        error?.message?.includes('API key')
      ) {
        console.warn('Firebase key invalid, falling back to mock Google login.');
        setShowMockAccountChooser(true);
        setIsLoading(false);
        return;
      }
      
      if (
        error?.code === 'auth/unauthorized-domain' ||
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/internal-error'
      ) {
        console.warn('Domain restriction or popup blocked in preview environment. Switching to Google account entry mode.');
        setShowMockAccountChooser(true);
        setShowCustomMockInput(true);
        setIsLoading(false);
        return;
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setServerError('구글 로그인 창이 닫혔습니다.');
      } else {
        setServerError(error?.message || '구글 로그인 중 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  const handleSelectMockAccount = (selectedEmail: string, selectedName: string) => {
    setIsLoading(true);
    setCustomMockEmail(selectedEmail); // Show chosen email in the mock authentication screen
    
    let resolvedName = selectedName;
    if (selectedEmail === 'honest20090509@gmail.com') {
      resolvedName = '김교범';
    } else if (selectedEmail === 'hanwhateam78@gmail.com') {
      resolvedName = '김HANWHA';
    } else if (selectedEmail === 'mystair09@gmail.com') {
      resolvedName = '마이스터';
    }

    const photoURL = generateInitialsAvatar(resolvedName);
    
    const mockUser = {
      uid: 'mock-google-user-' + Math.random().toString(36).substring(2, 9),
      displayName: resolvedName,
      email: selectedEmail,
      photoURL: photoURL
    };
    localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
    
    let profile = {
      uid: mockUser.uid,
      name: mockUser.displayName,
      email: mockUser.email,
      avatarUrl: photoURL,
      highSchool: '서울마이스터고등학교',
      major: '전기전자과',
      mbti: 'ENTJ',
      hollandCode: 'RIC',
      targetCompanies: ['한국전력공사', '삼성전자']
    };

    if (selectedEmail === 'honest20090509@gmail.com') {
      profile.major = '소프트웨어학과';
      profile.mbti = 'INFJ';
      profile.hollandCode = 'IAS';
      profile.targetCompanies = ['삼성전자', '네이버', '카카오'];
    } else if (selectedEmail === 'hanwhateam78@gmail.com') {
      profile.major = '메카트로닉스과';
      profile.mbti = 'ESTJ';
      profile.hollandCode = 'RCE';
      profile.targetCompanies = ['한화에어로스페이스', '현대자동차', '한국전력공사'];
    } else if (selectedEmail === 'mystair09@gmail.com') {
      profile.major = '자동화시스템과';
      profile.mbti = 'INTP';
      profile.hollandCode = 'IRC';
      profile.targetCompanies = ['한국동서발전', '포스코DX'];
    }

    localStorage.setItem('mystair_local_user_profile', JSON.stringify(profile));
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('viewingPromo', 'false');

    // Add 1.5 seconds delay to show polished Google account connecting screen
    setTimeout(() => {
      setIsLoading(false);
      setShowMockAccountChooser(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 1500);
  };

  const handleCustomMockLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMockEmail) return;
    const name = customMockName || customMockEmail.split('@')[0];
    handleSelectMockAccount(customMockEmail, name);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (signupPassword.length < 8) {
      setSignupPasswordError('비밀번호는 8글자 이상이어야 합니다.');
      hasError = true;
    } else if (!/[!@#$%^&*(),.?":{}|<>\-_=+~`'[\]\\]/.test(signupPassword)) {
      setSignupPasswordError('특수기호를 반드시 포함해야 합니다.');
      hasError = true;
    } else {
      setSignupPasswordError('');
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupConfirmPasswordError('비밀번호가 일치하지 않습니다');
      hasError = true;
    } else {
      setSignupConfirmPasswordError('');
    }

    if (hasError) return;

    setServerError('');
    setIsLoading(true);
    const normEmail = signupEmail.toLowerCase().trim();

    try {
      let success = false;

      // Check if already registered in localStorage first
      const rawUsers = localStorage.getItem('mystair_registered_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      if (users.some(u => u.email === normEmail)) {
        setServerError('이미 가입된 이메일입니다.');
        setIsLoading(false);
        return;
      }

      // 1. Attempt Backend API (/api/signup)
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normEmail, password: signupPassword })
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok) {
            success = true;
          } else if (response.status === 400 && data.message) {
            setServerError(data.message);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend signup request failed, falling back to Firebase/Local:', err);
      }

      // 2. Fallback: Firebase Auth
      if (!success) {
        const currentApiKey = auth?.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
        const isDummyKey = !currentApiKey || currentApiKey === "AIzaSyDummyKeyForLocalDevOnly";
        if (!isDummyKey) {
          try {
            await createUserWithEmailAndPassword(auth, normEmail, signupPassword);
            success = true;
          } catch (fbErr: any) {
            if (fbErr.code === 'auth/email-already-in-use') {
              setServerError('이미 가입된 이메일입니다.');
              setIsLoading(false);
              return;
            }
            console.warn('Firebase signup failed, trying local registry:', fbErr);
          }
        }
      }

      // Always save to LocalStorage registered users so login succeeds reliably
      const newUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 11),
        email: normEmail,
        password: signupPassword,
        displayName: normEmail.split('@')[0]
      };
      users.push(newUser);
      localStorage.setItem('mystair_registered_users', JSON.stringify(users));
      success = true;

      if (success) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        setEmail(signupEmail);
        setStep('login');
        setLoginMethod('email');
        setSignupPassword('');
        setSignupConfirmPassword('');
      } else {
        setServerError('회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setServerError(error?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full font-sans bg-black overflow-hidden flex">
      {/* Background: Spline Iframe full width to track cursor everywhere */}
      <div className="absolute inset-0 z-0 hidden md:block w-full h-full overflow-hidden">
        <iframe 
          src="https://my.spline.design/robotfollowcursorforlandingpage-xEAezW31ESPydMaGMIwVZ55C/" 
          frameBorder="0" 
          style={{ width: '170vw', height: '100vh', marginLeft: '-65vw' }}
          title="Spline 3D Robot"
        ></iframe>
      </div>

      {/* Overlay: Layout */}
      <div className="relative z-10 flex w-full h-full pointer-events-none">
        {/* Left side (empty space for Spline) */}
        <div className="hidden md:block w-[30%] h-full"></div>

        {/* Right side: Login Form */}
        <div className="w-full md:w-[70%] h-full flex flex-col justify-center items-center relative pointer-events-none overflow-y-auto py-8">
          <div className="absolute inset-0 bg-white pointer-events-none"></div>
          {/* Back button */}
          <button 
            onClick={onBack}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-500 hover:text-black transition-colors z-10 pointer-events-auto px-3 py-1.5 rounded-lg text-sm sm:text-base"
          >{t('login.back')}</button>

          <div className="w-full max-w-sm px-6 sm:px-8 relative z-10 pointer-events-auto my-auto">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex items-center group cursor-pointer">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
                  <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            {step === 'signup' ? t('login.title.signup') : t('login.title.login')}
          </h1>
          <p className="text-gray-500 text-center mb-10 text-sm">
            {step === 'signup' ? t('login.subtitle.signup') : t('login.subtitle.login')}
          </p>
          
          {step === 'signup' ? (
            <form className="flex flex-col gap-5" onSubmit={handleSignupSubmit}>
              {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{serverError}</div>}
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-email" className="text-sm text-gray-600 font-medium">{t('login.email')}</label>
                <input 
                  type="email" 
                  id="signup-email" 
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder={t('login.placeholder.email')} 
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-password" className="text-sm text-gray-600 font-medium">{t('login.password')}</label>
                <input 
                  type="password" 
                  id="signup-password" 
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (signupPasswordError) setSignupPasswordError('');
                  }}
                  placeholder={t('login.placeholder.password.create')} 
                  className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    signupPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`} 
                />
                {signupPasswordError && <p className="text-red-500 text-xs">{signupPasswordError}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-confirm-password" className="text-sm text-gray-600 font-medium">{t('login.password.confirm')}</label>
                <input 
                  type="password" 
                  id="signup-confirm-password" 
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    if (signupConfirmPasswordError) setSignupConfirmPasswordError('');
                  }}
                  placeholder={t('login.placeholder.password.confirm')} 
                  className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    signupConfirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`} 
                />
                {signupConfirmPasswordError && <p className="text-red-500 text-xs">{signupConfirmPasswordError}</p>}
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-[#5C55FA] hover:bg-[#4d46e5] text-white rounded-lg py-3 font-semibold transition-colors mt-2 disabled:opacity-50">
                {isLoading ? t('login.button.processing') : t('login.button.signup')}
              </button>
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('login.has_account')} <button type="button" onClick={() => { setStep('login'); setLoginMethod('select'); }} className="text-[#5C55FA] hover:underline font-medium">{t('login.button.login')}</button>
              </div>
            </form>
          ) : loginMethod === 'select' ? (
            <div className="flex flex-col gap-4">
              {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{serverError}</div>}
              
              {/* 이메일 또는 사용자 이름 로그인 버튼 */}
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold rounded-xl py-3.5 px-5 flex items-center justify-center gap-3 transition-colors border border-gray-950 shadow-md cursor-pointer text-sm sm:text-base"
              >
                {/* Custom Elegant Stair/Arrow icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                <span>이메일 또는 사용자 이름</span>
              </button>

              {/* Google로 로그인 버튼 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl py-3.5 px-5 flex items-center justify-center gap-3 transition-colors border border-gray-300 shadow-sm cursor-pointer text-sm sm:text-base"
              >
                {/* Google Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google로 로그인</span>
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                {t('login.no_account')} <button type="button" onClick={() => setStep('signup')} className="text-[#5C55FA] hover:underline font-medium">{t('login.button.signup')}</button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{serverError}</div>}
              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm text-gray-600 font-medium">{t('login.email')}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(false);
                    }}
                    placeholder={t('login.placeholder.email')} 
                    className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                      emailError 
                        ? 'border-red-500 focus:ring-red-500 text-red-900' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs">{t('login.error.email')}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm text-gray-600 font-medium">{t('login.password')}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder={t('login.placeholder.password.enter')} 
                    className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 pr-10 ${
                      passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#5C55FA] hover:bg-[#4d46e5] text-white rounded-lg py-3 font-semibold transition-colors mt-2 disabled:opacity-50 animate-pulse-subtle"
              >
                {isLoading ? t('login.button.processing') : t('login.button.login')}
              </button>

              <div className="mt-4 flex flex-col gap-2 items-center text-sm text-gray-500">
                <button type="button" onClick={() => setLoginMethod('select')} className="text-gray-400 hover:text-gray-600 hover:underline text-xs">
                  ← 다른 로그인 방법 선택
                </button>
                <div className="mt-1">
                  {t('login.no_account')} <button type="button" onClick={() => setStep('signup')} className="text-[#5C55FA] hover:underline font-medium">{t('login.button.signup')}</button>
                </div>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>

      {/* Google 계정 선택 모달 (Google Account Chooser) */}
      {showMockAccountChooser && (
        <div className="fixed inset-0 z-[200] bg-[#f0f4f9] sm:bg-[#f0f4f9] flex flex-col justify-between items-center text-left font-sans overflow-y-auto py-6 sm:py-12 px-4 selection:bg-blue-200">
          {/* Top closing button */}
          <button 
            onClick={() => { setShowMockAccountChooser(false); setShowCustomMockInput(false); }}
            className="absolute top-4 right-4 text-gray-500 hover:text-black hover:bg-gray-200/50 p-2 rounded-full transition-colors"
            title="창 닫기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Spacer to push container down */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="bg-white rounded-[28px] border-0 sm:border border-[#dadce0] p-6 sm:p-10 max-w-[450px] w-full sm:shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-left flex flex-col">
              {/* Google Logo */}
              <div className="mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {/* Google Material Spinner */}
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-red-500 border-b-yellow-500 border-l-green-500 animate-spin"></div>
                  </div>
                  <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-1">안전하게 로그인하는 중</h3>
                  <p className="text-[14px] text-[#5f6368] mb-4">Google 서비스와 연결을 시도하고 있습니다...</p>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs text-[#5f6368] flex items-center gap-2 max-w-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-500 shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="truncate">{customMockEmail || 'Google 계정'}</span>
                  </div>
                </div>
              ) : !showCustomMockInput ? (
                <div>
                  <h2 className="text-[24px] font-normal text-[#1f1f1f] leading-8 mb-1">계정을 선택하세요.</h2>
                  <div className="text-[14px] text-[#1f1f1f] mb-6">
                    <span className="text-blue-600 hover:underline cursor-pointer font-medium">MyStair(으)로 이동</span>
                  </div>

                  <div className="flex flex-col mb-4 max-h-[300px] overflow-y-auto pr-1">
                    {/* Account 1: 김교범 */}
                    <div 
                      onClick={() => handleSelectMockAccount('honest20090509@gmail.com', '김교범')} 
                      className="flex items-center justify-between py-3.5 border-b border-[#e3e3e3] hover:bg-gray-50 cursor-pointer px-1 -mx-1 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#E52597] text-white font-medium flex items-center justify-center text-[13px] shrink-0">
                          교범
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#1f1f1f] truncate group-hover:text-blue-600">김교범</p>
                          <p className="text-[12px] text-[#474747] truncate">honest20090509@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    {/* Account 2: 김HANWHA TEAM */}
                    <div 
                      onClick={() => handleSelectMockAccount('hanwhateam78@gmail.com', '김HANWHA TEAM')} 
                      className="flex items-center justify-between py-3.5 border-b border-[#e3e3e3] hover:bg-gray-50 cursor-pointer px-1 -mx-1 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#b06000] text-white font-medium flex items-center justify-center text-[13px] shrink-0">
                          H
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#1f1f1f] truncate group-hover:text-blue-600">김HANWHA TEAM</p>
                          <p className="text-[12px] text-[#474747] truncate">hanwhateam78@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    {/* Account 3: mystair09@gmail.com */}
                    <div 
                      onClick={() => handleSelectMockAccount('mystair09@gmail.com', 'mystair09')} 
                      className="flex items-center justify-between py-3.5 border-b border-[#e3e3e3] hover:bg-gray-50 cursor-pointer px-1 -mx-1 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#4a5568] text-white font-medium flex items-center justify-center text-[13px] shrink-0">
                          M
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#1f1f1f] truncate group-hover:text-blue-600">mystair09@gmail.com</p>
                          <p className="text-[12px] text-[#474747] truncate">mystair09@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    {/* 다른 계정 사용 */}
                    <div 
                      onClick={() => setShowCustomMockInput(true)} 
                      className="flex items-center gap-3.5 py-4 hover:bg-gray-50 cursor-pointer px-1 -mx-1 transition-colors text-[#1f1f1f]"
                    >
                      <div className="w-[32px] h-[32px] rounded-full bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="text-[14px] font-medium text-[#1f1f1f]">다른 계정 사용</span>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#5f6368] leading-relaxed mt-4">
                    앱을 사용하기 전에 <span className="text-blue-600 font-medium">MyStair</span>의 <span className="text-blue-600 font-medium cursor-pointer hover:underline">개인정보처리방침</span> 및 <span className="text-blue-600 font-medium cursor-pointer hover:underline">서비스 약관</span>을 검토하세요.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCustomMockLoginSubmit} className="flex flex-col w-full">
                  <h2 className="text-[24px] font-normal text-[#1f1f1f] leading-8 mb-1">로그인</h2>
                  <p className="text-[14px] text-[#1f1f1f] mb-6">Google 계정으로 로그인</p>

                  <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                      <input 
                        type="email"
                        placeholder="이메일 주소 (예: user@gmail.com)"
                        required
                        value={customMockEmail}
                        onChange={(e) => setCustomMockEmail(e.target.value)}
                        className="w-full border border-[#dadce0] rounded-lg py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-[14px]"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="사용자 이름 (예: 홍길동)"
                        required
                        value={customMockName}
                        onChange={(e) => setCustomMockName(e.target.value)}
                        className="w-full border border-[#dadce0] rounded-lg py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-[14px]"
                      />
                    </div>
                  </div>

                  {/* Link to developer/test accounts */}
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={() => setShowCustomMockInput(false)}
                      className="text-[14px] text-blue-600 hover:underline font-medium focus:outline-none cursor-pointer"
                    >
                      또는 개발자/테스트 계정 선택하기
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      type="button" 
                      onClick={() => setShowMockAccountChooser(false)}
                      className="text-gray-500 hover:bg-gray-100 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-[14px] transition-colors shadow-sm cursor-pointer"
                    >
                      다음
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="w-full max-w-[450px] flex justify-between items-center text-[12px] text-[#5f6368] px-4 select-none">
            <div className="relative">
              <span className="hover:text-black cursor-pointer">한국어 ▾</span>
            </div>
            <div className="flex gap-4">
              <span className="hover:text-black cursor-pointer">도움말</span>
              <span className="hover:text-black cursor-pointer">개인정보처리방침</span>
              <span className="hover:text-black cursor-pointer">약관</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
