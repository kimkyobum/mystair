const fs = require('fs');

let content = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');

// The end of the file should look like this:
const correctEnd = `
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ko';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('language');
      if (saved === 'ko' || saved === 'en') {
        setLanguageState(saved);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    window.dispatchEvent(new Event('storage'));
  };

  const t = (keyOrKo: string, fallbackEn?: string) => {
    if (!keyOrKo) return '';
    if (language === 'ko') {
      if ((translations.ko as any)[keyOrKo]) {
        return (translations.ko as any)[keyOrKo];
      }
      return keyOrKo;
    }
    // English mode
    if ((translations.en as any)[keyOrKo]) {
      return (translations.en as any)[keyOrKo];
    }
    if (fallbackEn) {
      return fallbackEn;
    }
    if (koToEnMap[keyOrKo]) {
      return koToEnMap[keyOrKo];
    }
    return keyOrKo;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
`;

let idx = content.indexOf('  const [language, setLanguageState] = useState<Language>(() => {');
if(idx !== -1) {
    fs.writeFileSync('src/friend_site/LanguageContext.tsx', content.substring(0, idx) + correctEnd);
    console.log("Restored the end of the file!");
}
