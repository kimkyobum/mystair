import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess?: () => void;
}

export default function Login({ onBack, onLoginSuccess }: LoginProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'email' | 'password' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signup states
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [signupConfirmPasswordError, setSignupConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValid) {
        setEmailError(true);
      } else {
        setEmailError(false);
        setStep('password');
      }
    } else {
      // Proceed with login logic
      setServerError('');
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://mystair-backend.onrender.com';
        const response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
           if (onLoginSuccess) {
             onLoginSuccess();
           } else {
             window.location.href = 'https://mystair3-three.vercel.app/';
           }
        } else {
           const data = await response.json().catch(() => ({}));
           setServerError(data.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
        setServerError('서버와 통신할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (signupPassword.length < 8) {
      setSignupPasswordError('8글자 이상이여야 합니다');
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

    if (!hasError) {
      setServerError('');
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://mystair-backend.onrender.com';
        const response = await fetch(`${apiUrl}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signupEmail, password: signupPassword })
        });
        
        if (response.ok) {
           alert('회원가입이 완료되었습니다. 로그인해주세요.');
           setEmail(signupEmail);
           setStep('email');
           setSignupPassword('');
           setSignupConfirmPassword('');
        } else {
           const data = await response.json().catch(() => ({}));
           setServerError(data.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        setServerError('서버와 통신할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full font-sans bg-black overflow-hidden flex">
      {/* Background: Spline Iframe full width to track cursor everywhere */}
      <div className="absolute inset-0 z-0 hidden md:block w-full h-full overflow-hidden">
        <iframe 
          src="https://my.spline.design/robotfollowcursorforlandingpage-xEAezW31ESPydMaGMIwVZ55C/" 
          frameBorder="0" 
          style={{ width: '170vw', height: '100vh', marginLeft: '-70vw' }}
          title="Spline 3D Robot"
        ></iframe>
      </div>

      {/* Overlay: Layout */}
      <div className="relative z-10 flex w-full h-full pointer-events-none">
        {/* Left side (empty space for Spline) */}
        <div className="hidden md:block w-[30%] h-full"></div>

        {/* Right side: Login Form */}
        <div className="w-full md:w-[70%] h-full flex flex-col justify-center items-center relative pointer-events-none">
          <div className="absolute inset-0 bg-white pointer-events-none"></div>
          {/* Back button */}
          <button 
            onClick={onBack}
            className="absolute top-8 right-8 text-gray-500 hover:text-black transition-colors z-10 pointer-events-auto"
          >{t('login.back')}</button>

          <div className="w-full max-w-sm px-8 relative z-10 pointer-events-auto">
            <div className="flex justify-center mb-8">
              <div className="flex items-center group cursor-pointer">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-500 group-hover:rotate-90 transition-transform duration-700 ease-in-out">
                  <path d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="currentColor"/>
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
                {t('login.has_account')} <button type="button" onClick={() => setStep('email')} className="text-[#5C55FA] hover:underline font-medium">{t('login.button.login')}</button>
              </div>
            </form>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{serverError}</div>}
                {step === 'email' ? (
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
                ) : (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm text-gray-600 font-medium">{t('login.password.for')} {email}</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login.placeholder.password.enter')} 
                        className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 pr-10"
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
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#5C55FA] hover:bg-[#4d46e5] text-white rounded-lg py-3 font-semibold transition-colors mt-2 disabled:opacity-50"
                >
                  {isLoading ? t('login.button.processing') : (step === 'email' ? t('login.button.letsgo') : t('login.button.login'))}
                </button>

                <div className="mt-2 text-center text-sm text-gray-500">
                  {t('login.no_account')} <button type="button" onClick={() => setStep('signup')} className="text-[#5C55FA] hover:underline font-medium">{t('login.button.signup')}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
