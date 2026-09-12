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
  hollandNote?: string;
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
  saveDiary: (diary: Omit<DiaryEntry, 'userId'>) => Promise<string>;
  deleteDiary: (diaryId: string) => Promise<void>;
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

const DEFAULT_PROFILE: Omit<UserProfileData, 'uid'> = {
  name: '',
  email: '',
  highSchool: '',
  major: '',
  mbti: '',
  hollandCode: '',
  targetCompanies: []
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

  const getEffectiveUid = (currentUser?: FirebaseUser | any): string => {
    if (currentUser?.uid) return currentUser.uid;
    if (currentUser?.email) return 'user_' + currentUser.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    try {
      const savedMock = localStorage.getItem('mystair_mock_user');
      if (savedMock) {
        const parsed = JSON.parse(savedMock);
        if (parsed?.uid) return parsed.uid;
        if (parsed?.email) return 'user_' + parsed.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      }
    } catch (e) {}
    return 'local-user';
  };

  const loadUserProfile = async (currentUser: FirebaseUser | any) => {
    const currentUid = getEffectiveUid(currentUser);

    // 1. Read existing local caches first
    let localProfile: any = null;
    try {
      const savedMypage = localStorage.getItem(`mystair_mypage_data_${currentUid}`);
      const savedLocal = localStorage.getItem(`mystair_local_user_profile_${currentUid}`);
      const savedGeneral = localStorage.getItem(`mystair_user_profile_${currentUid}`);
      localProfile = savedMypage ? JSON.parse(savedMypage) : (savedLocal ? JSON.parse(savedLocal) : (savedGeneral ? JSON.parse(savedGeneral) : null));
    } catch (e) {}

    // 2. Fetch remote profile from Firestore & server API
    const remoteProfile = await apiService.getProfile(currentUid);

    const name = remoteProfile?.name || localProfile?.name || currentUser.displayName || '마이스터 인재';
    const avatarUrl = remoteProfile?.avatarUrl || localProfile?.avatarUrl || currentUser.photoURL || generateInitialsAvatar(name);
    const email = remoteProfile?.email || localProfile?.email || currentUser.email || '';
    const highSchool = remoteProfile?.highSchool || localProfile?.highSchool || '';
    const major = remoteProfile?.major || localProfile?.major || '';
    const mbti = remoteProfile?.mbti || localProfile?.mbti || '';
    const hollandCode = remoteProfile?.hollandCode || localProfile?.hollandCode || '';
    const hollandNote = remoteProfile?.hollandNote || localProfile?.hollandNote || '';
    const targetCompanies = (remoteProfile?.targetCompanies && remoteProfile.targetCompanies.length > 0)
      ? remoteProfile.targetCompanies
      : (localProfile?.targetCompanies && localProfile.targetCompanies.length > 0 ? localProfile.targetCompanies : []);

    const resolvedProfile: UserProfileData = {
      uid: currentUid,
      name,
      email,
      avatarUrl,
      highSchool,
      major,
      mbti,
      hollandCode,
      targetCompanies,
      createdAt: remoteProfile?.createdAt || localProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`mystair_mypage_data_${currentUid}`, JSON.stringify(resolvedProfile));
    localStorage.setItem(`mystair_local_user_profile_${currentUid}`, JSON.stringify(resolvedProfile));
    localStorage.setItem(`mystair_user_profile_${currentUid}`, JSON.stringify(resolvedProfile));

    setUserProfile(resolvedProfile);
    await apiService.updateProfile(resolvedProfile, currentUid);
  };

  const loginWithGoogle = async () => {
    // Pre-emptively detect dummy/invalid key to bypass Firebase Auth popups that will fail
    const currentApiKey = auth?.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
    const isDummyKey = !currentApiKey || currentApiKey === "AIzaSyDummyKeyForLocalDevOnly";
    if (isDummyKey) {
      console.warn('Using graceful mock Google login since real Firebase credentials are not provided.');
      const displayName = '마이스터 구글 인재';
      const mockUser = {
        uid: 'mock-google-user-123',
        displayName: displayName,
        email: 'meister_google@mystair.com',
        photoURL: generateInitialsAvatar(displayName)
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
        const displayName = '마이스터 구글 인재';
        const mockUser = {
          uid: 'mock-google-user-123',
          displayName: displayName,
          email: 'meister_google@mystair.com',
          photoURL: generateInitialsAvatar(displayName)
        };
        localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
        setUser(mockUser as any);
        await loadUserProfile(mockUser as any);
        return;
      }

      if (
        error?.code === 'auth/unauthorized-domain' ||
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/operation-not-allowed'
      ) {
        console.warn('Firebase domain restriction or popup blocked, falling back to mock Google user.');
        const displayName = '구글 사용자';
        const mockUser = {
          uid: 'mock-google-user-' + Math.random().toString(36).substring(2, 9),
          displayName: displayName,
          email: 'google_user@gmail.com',
          photoURL: generateInitialsAvatar(displayName)
        };
        localStorage.setItem('mystair_mock_user', JSON.stringify(mockUser));
        setUser(mockUser as any);
        await loadUserProfile(mockUser as any);
        return;
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('구글 로그인 창이 닫혔습니다.');
      }
      throw new Error(error?.message || '구글 로그인 중 오류가 발생했습니다.');
    }
  };

  const loginAnonymously = async () => {
    const currentApiKey = auth?.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
    const isDummyKey = !currentApiKey || currentApiKey === "AIzaSyDummyKeyForLocalDevOnly";
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
    const currentUid = getEffectiveUid(user);
    
    // Read existing local caches to never drop fields
    let localSaved: any = {};
    try {
      const s = localStorage.getItem(`mystair_mypage_data_${currentUid}`) || localStorage.getItem(`mystair_local_user_profile_${currentUid}`);
      if (s) localSaved = JSON.parse(s);
    } catch (e) {}

    const updated = {
      uid: currentUid,
      ...localSaved,
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    } as UserProfileData;

    // Immediately cache locally so no race condition or instant unmount loses data
    localStorage.setItem(`mystair_mypage_data_${currentUid}`, JSON.stringify(updated));
    localStorage.setItem(`mystair_local_user_profile_${currentUid}`, JSON.stringify(updated));
    localStorage.setItem(`mystair_user_profile_${currentUid}`, JSON.stringify(updated));

    setUserProfile(updated);

    const savedProfile = await apiService.updateProfile(updated, currentUid);
    if (savedProfile) {
      setUserProfile(prev => ({ ...prev, ...savedProfile }));
    }
  };

  const fetchDiaries = async (): Promise<DiaryEntry[]> => {
    const currentUid = user ? user.uid : 'local-user';
    const diaries = await apiService.getDiaries(currentUid);
    return diaries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  };

  const saveDiary = async (diary: Omit<DiaryEntry, 'userId'>): Promise<string> => {
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

