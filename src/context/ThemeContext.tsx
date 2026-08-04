import React, { createContext, useContext, useState, useEffect } from 'react';

type BackgroundType = 'black' | 'gradient' | 'none';

interface ThemeContextType {
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
  backgroundType: BackgroundType;
  setBackgroundType: (val: BackgroundType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('mystair_light_mode') === 'true';
  });
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(() => {
    return (localStorage.getItem('mystair_bg_type') as BackgroundType) || 'black';
  });

  useEffect(() => {
    localStorage.setItem('mystair_light_mode', String(isLightMode));
  }, [isLightMode]);

  useEffect(() => {
    localStorage.setItem('mystair_bg_type', backgroundType);
  }, [backgroundType]);

  return (
    <ThemeContext.Provider value={{ isLightMode, setIsLightMode, backgroundType, setBackgroundType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
