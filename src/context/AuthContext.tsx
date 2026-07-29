import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  FirebaseUser,
  signInAnonymously
} from '../lib/firebase';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  highSchool: string;
  major: string;
  mbti: string;
  hollandCode: string;
  targetCompanies: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DiaryEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileInFirestore: (data: Partial<UserProfileData>) => Promise<void>;
  fetchDiaries: () => Promise<DiaryEntry[]>;
  saveDiary: (diary: Omit<DiaryEntry, 'id' | 'userId'>) => Promise<string>;
  deleteDiary: (diaryId: string) => Promise<void>;
}

const DEFAULT_PROFILE: Omit<UserProfileData, 'uid'> = {
  name: '홍길동',
  email: 'meister@mystair.com',
  highSchool: '서울로봇고등학교',
  major: '로봇소프트웨어과',
  mbti: 'INTJ',
  hollandCode: 'RC',
  targetCompanies: ['삼성전자', '현대자동차', '한화에어로스페이스', 'LG에너지솔루션']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = (currentUser: FirebaseUser) => {
    const saved = localStorage.getItem('mystair_local_user_profile');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing local user profile:', e);
      }
    }

    const newProfile: UserProfileData = {
      uid: currentUser.uid,
      name: currentUser.displayName || '마이스터 인재',
      email: currentUser.email || 'user@mystair.com',
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('mystair_local_user_profile', JSON.stringify(newProfile));
    setUserProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('현재 배포 도메인(Vercel/Render)이 Firebase의 [승인된 도메인]에 등록되지 않았습니다.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('구글 로그인 창이 닫혔습니다.');
      }
      throw new Error(error?.message || '구글 로그인 중 오류가 발생했습니다.');
    }
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfileInFirestore = async (data: Partial<UserProfileData>) => {
    const currentUid = user ? user.uid : 'local-user';
    const updated = {
      uid: currentUid,
      ...DEFAULT_PROFILE,
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    } as UserProfileData;

    localStorage.setItem('mystair_local_user_profile', JSON.stringify(updated));
    setUserProfile(updated);
  };

  const fetchDiaries = async (): Promise<DiaryEntry[]> => {
    try {
      const saved = localStorage.getItem('mystair_local_diaries');
      if (saved) {
        const entries: DiaryEntry[] = JSON.parse(saved);
        return entries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      }
    } catch (error) {
      console.error('Error fetching local diaries:', error);
    }
    return [];
  };

  const saveDiary = async (diary: Omit<DiaryEntry, 'id' | 'userId'>): Promise<string> => {
    const newId = Date.now().toString();
    const newEntry: DiaryEntry = {
      ...diary,
      id: newId,
      userId: user ? user.uid : 'local-user',
      createdAt: new Date().toISOString()
    };

    const currentDiaries = await fetchDiaries();
    const updated = [newEntry, ...currentDiaries];
    localStorage.setItem('mystair_local_diaries', JSON.stringify(updated));
    return newId;
  };

  const deleteDiary = async (diaryId: string) => {
    const currentDiaries = await fetchDiaries();
    const updated = currentDiaries.filter(d => d.id !== diaryId);
    localStorage.setItem('mystair_local_diaries', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      loginWithGoogle,
      loginAnonymously,
      logout,
      updateProfileInFirestore,
      fetchDiaries,
      saveDiary,
      deleteDiary
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

