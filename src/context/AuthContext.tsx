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

import { apiService } from '../api_client/api';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
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
    // Check if we have a saved mock user from previous fallback login
    const savedMockUser = localStorage.getItem('mystair_mock_user');
    if (savedMockUser) {
      try {
        const parsedUser = JSON.parse(savedMockUser);
        setUser(parsedUser);
        loadUserProfile(parsedUser);
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse mock user', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        localStorage.removeItem('mystair_mock_user'); // Clear mock if real user authenticated
        setUser(currentUser);
        await loadUserProfile(currentUser);
        setLoading(false);
      } else {
        // If there's no firebase user AND no saved mock user, reset profile to local fallback
        if (!localStorage.getItem('mystair_mock_user')) {
          setUser(null);
          const localProfile = await apiService.getProfile('local-user');
          setUserProfile(localProfile as UserProfileData);
          setLoading(false);
        }
      }
    }, (error) => {
      console.warn('onAuthStateChanged subscription error (likely invalid Firebase key):', error);
      // Ensure we clear loading even if Firebase has API key initialization issues
      if (!localStorage.getItem('mystair_mock_user')) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (currentUser: FirebaseUser) => {
    const remoteProfile = await apiService.getProfile(currentUser.uid);
    if (remoteProfile) {
      setUserProfile(remoteProfile as UserProfileData);
      return;
    }

    const newProfile: UserProfileData = {
      uid: currentUser.uid,
      name: currentUser.displayName || '마이스터 인재',
      email: currentUser.email || 'user@mystair.com',
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await apiService.updateProfile(newProfile, currentUser.uid);
    setUserProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    // Pre-emptively detect dummy/invalid key to bypass Firebase Auth popups that will fail
    const isDummyKey = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForLocalDevOnly";
    if (isDummyKey) {
      console.warn('Using graceful mock Google login since real Firebase credentials are not provided.');
      const mockUser = {
        uid: 'mock-google-user-123',
        displayName: '마이스터 구글 인재',
        email: 'meister_google@mystair.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      };
      localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
      setUser(mockUser as any);
      await loadUserProfile(mockUser as any);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google login failed:', error);
      // If the error indicates invalid key, use fallback
      if (
        error?.message?.includes('api-key-not-valid') || 
        error?.code?.includes('api-key-not-valid') || 
        error?.message?.includes('API key')
      ) {
        console.warn('Firebase key invalid, falling back to mock Google login.');
        const mockUser = {
          uid: 'mock-google-user-123',
          displayName: '마이스터 구글 인재',
          email: 'meister_google@mystair.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        };
        localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
        setUser(mockUser as any);
        await loadUserProfile(mockUser as any);
        return;
      }

      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('현재 배포 도메인(Vercel/Render)이 Firebase의 [승인된 도메인]에 등록되지 않았습니다.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('구글 로그인 창이 닫혔습니다.');
      }
      throw new Error(error?.message || '구글 로그인 중 오류가 발생했습니다.');
    }
  };

  const loginAnonymously = async () => {
    const isDummyKey = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForLocalDevOnly";
    if (isDummyKey) {
      console.warn('Using graceful mock Anonymous login since real Firebase credentials are not provided.');
      const mockUser = {
        uid: 'mock-anon-user-123',
        displayName: '익명 마이스터',
        email: 'anon@mystair.com'
      };
      localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
      setUser(mockUser as any);
      await loadUserProfile(mockUser as any);
      return;
    }

    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Anonymous login failed:', error);
      if (
        error?.message?.includes('api-key-not-valid') || 
        error?.code?.includes('api-key-not-valid') || 
        error?.message?.includes('API key')
      ) {
        console.warn('Firebase key invalid, falling back to mock Anonymous login.');
        const mockUser = {
          uid: 'mock-anon-user-123',
          displayName: '익명 마이스터',
          email: 'anon@mystair.com'
        };
        localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
        setUser(mockUser as any);
        await loadUserProfile(mockUser as any);
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mystair_mock_user');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserProfile(null);
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

    const savedProfile = await apiService.updateProfile(updated, currentUid);
    setUserProfile(savedProfile as UserProfileData);
  };

  const fetchDiaries = async (): Promise<DiaryEntry[]> => {
    const currentUid = user ? user.uid : 'local-user';
    const diaries = await apiService.getDiaries(currentUid);
    return diaries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  };

  const saveDiary = async (diary: Omit<DiaryEntry, 'id' | 'userId'>): Promise<string> => {
    const currentUid = user ? user.uid : 'local-user';
    const savedEntry = await apiService.addDiary(diary, currentUid);
    return savedEntry.id;
  };

  const deleteDiary = async (diaryId: string) => {
    const currentUid = user ? user.uid : 'local-user';
    await apiService.deleteDiary(diaryId, currentUid);
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

