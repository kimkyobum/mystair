import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  FirebaseUser,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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
        // Fetch profile from Firestore
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (currentUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfileData);
      } else {
        // Initialize user profile in Firestore
        const newProfile: UserProfileData = {
          uid: currentUser.uid,
          name: currentUser.displayName || '마이스터 인재',
          email: currentUser.email || 'user@mystair.com',
          ...DEFAULT_PROFILE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback local state if offline or permission issue
      setUserProfile({
        uid: currentUser.uid,
        name: currentUser.displayName || '마이스터 인재',
        email: currentUser.email || 'user@mystair.com',
        ...DEFAULT_PROFILE
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
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
    if (!user) return;
    try {
      const updated = {
        ...userProfile,
        ...data,
        updatedAt: new Date().toISOString()
      } as UserProfileData;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updated, { merge: true });
      setUserProfile(updated);
    } catch (error) {
      console.error('Failed to update profile in Firestore:', error);
      // Fallback update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
    }
  };

  const fetchDiaries = async (): Promise<DiaryEntry[]> => {
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'diaries'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const entries: DiaryEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        entries.push({ id: docSnap.id, ...docSnap.data() } as DiaryEntry);
      });
      // Sort client-side by date descending
      return entries.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    } catch (error) {
      console.error('Error fetching diaries:', error);
      return [];
    }
  };

  const saveDiary = async (diary: Omit<DiaryEntry, 'id' | 'userId'>): Promise<string> => {
    if (!user) throw new Error('로그인이 필요합니다.');
    const newEntry: DiaryEntry = {
      ...diary,
      userId: user.uid,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'diaries'), newEntry);
    return docRef.id;
  };

  const deleteDiary = async (diaryId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'diaries', diaryId));
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
