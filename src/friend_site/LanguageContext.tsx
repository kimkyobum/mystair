import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ko: {
    'nav.map': '마이스터고 지도',
    'nav.creators': '만든 사람들',
    'nav.traffic': '트래픽 리포트',
    'nav.settings': '설정',
    'nav.login': '로그인',
    'dashboard.welcome': '환영합니다',
    'login.title.signup': '회원가입',
    'login.title.login': '환영합니다',
    'login.subtitle.signup': '가입하고 시작해보세요.',
    'login.subtitle.login': '이메일을 입력하고 시작하세요.',
    'login.email': '이메일',
    'login.password': '비밀번호입력',
    'login.password.confirm': '새비밀번호입력',
    'login.password.enter': '비밀번호를 입력하세요',
    'login.button.signup': '회원가입',
    'login.button.login': '로그인',
    'login.button.processing': '처리 중...',
    'login.button.letsgo': '다음으로',
    'login.no_account': '계정이 없으신가요?',
    'login.has_account': '이미 계정이 있으신가요?',
    'login.back': '돌아가기',
    'login.placeholder.email': 'you@example.com',
    'login.placeholder.password.create': '비밀번호 생성',
    'login.placeholder.password.confirm': '비밀번호 확인',
    'login.placeholder.password.enter': '비밀번호 입력',
    'login.password.for': '비밀번호',
    'login.error.email': '유효한 이메일을 입력해주세요.',
  },
  en: {
    'nav.map': 'Meister High School Map',
    'nav.creators': 'Creators',
    'nav.traffic': 'Traffic Report',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'dashboard.welcome': 'Welcome',
    'login.title.signup': 'Create an account',
    'login.title.login': 'Welcome',
    'login.subtitle.signup': 'Join us and get started.',
    'login.subtitle.login': 'Enter your email to get started.',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.password.confirm': 'Confirm Password',
    'login.password.enter': 'Enter your password',
    'login.button.signup': 'Sign up',
    'login.button.login': 'Log in',
    'login.button.processing': 'Processing...',
    'login.button.letsgo': 'Let\'s go',
    'login.no_account': 'Don\'t have an account?',
    'login.has_account': 'Already have an account?',
    'login.back': 'Back',
    'login.placeholder.email': 'you@example.com',
    'login.placeholder.password.create': 'Create a password',
    'login.placeholder.password.confirm': 'Confirm your password',
    'login.placeholder.password.enter': 'Enter your password',
    'login.password.for': 'Password for',
    'login.error.email': 'Please enter a valid email',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ko') ? saved : 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
