import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  highSchool?: string;
  major?: string;
  mbti?: string;
  hollandCode?: string;
  hollandNote?: string;
  targetCompanies?: string[];
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

export const getStableUserId = (email?: string, defaultId?: string): string => {
  if (email && email.trim()) {
    return 'user_' + email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  }
  try {
    const mockSaved = localStorage.getItem('mystair_mock_user');
    if (mockSaved) {
      const parsed = JSON.parse(mockSaved);
      if (parsed?.uid) return parsed.uid;
      if (parsed?.email) return 'user_' + parsed.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    const saved = localStorage.getItem('mystair_local_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.uid) return parsed.uid;
      if (parsed?.email) return 'user_' + parsed.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
  } catch (e) {
    console.error(e);
  }
  let localId = localStorage.getItem('mystair_user_id');
  if (!localId) {
    localId = defaultId || 'user_guest';
    localStorage.setItem('mystair_user_id', localId);
  }
  return localId;
};

const getUserId = (): string => getStableUserId();

export const apiService = {
  // 1. 프로필 API
  async getProfile(userId?: string): Promise<UserProfileData | null> {
    const uid = userId || getUserId();
    
    // 1-1. Local Storage immediate cache check
    const savedMypage = localStorage.getItem(`mystair_mypage_data_${uid}`);
    const savedLocal = localStorage.getItem(`mystair_local_user_profile_${uid}`);
    let cachedProfile: UserProfileData | null = null;
    if (savedMypage) {
      try { cachedProfile = JSON.parse(savedMypage); } catch (e) {}
    } else if (savedLocal) {
      try { cachedProfile = JSON.parse(savedLocal); } catch (e) {}
    }

    // 1-2. Try Firestore if available
    if (db) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as UserProfileData;
          const merged: UserProfileData = {
            ...cachedProfile,
            ...remoteData,
            uid
          };
          localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(merged));
          localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      }
    }

    // 1-3. Try Backend server API
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          const merged = {
            ...cachedProfile,
            ...data.profile,
            uid
          };
          localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(merged));
          localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn('Backend profile fetch failed, using local fallback:', err);
    }
    
    return cachedProfile;
  },

  async updateProfile(profileData: Partial<UserProfileData>, userId?: string): Promise<UserProfileData> {
    const uid = userId || profileData.uid || getUserId();
    
    // Merge with any existing local cache
    let existingLocal: any = {};
    try {
      const s = localStorage.getItem(`mystair_mypage_data_${uid}`) || localStorage.getItem(`mystair_local_user_profile_${uid}`);
      if (s) existingLocal = JSON.parse(s);
    } catch (e) {}

    const payload: UserProfileData = {
      ...existingLocal,
      ...profileData,
      uid,
      updatedAt: new Date().toISOString()
    };

    // Update Local Storage immediately
    localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(payload));
    localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(payload));
    localStorage.setItem(`mystair_user_profile_${uid}`, JSON.stringify(payload));

    // Try Firestore save
    if (db) {
      try {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, payload, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    }

    // Try Backend server save
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, profile: payload })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.profile) return result.profile;
      }
    } catch (err) {
      console.warn('Backend profile update failed, saved to local storage & firestore:', err);
    }

    return payload as UserProfileData;
  },

  // 2. 다이어리 API
  async getDiaries(userId?: string): Promise<DiaryEntry[]> {
    const uid = userId || getUserId();
    const saved = localStorage.getItem(`mystair_local_diaries_${uid}`);
    let localDiaries: DiaryEntry[] = saved ? JSON.parse(saved) : [];

    // Try Firestore read
    if (db) {
      try {
        const diariesCol = collection(db, 'diaries');
        const q = query(diariesCol, where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        const firestoreDiaries: DiaryEntry[] = [];
        querySnapshot.forEach(docSnap => {
          firestoreDiaries.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        if (firestoreDiaries.length > 0) {
          // Merge with local diaries
          const map = new Map<string, DiaryEntry>();
          localDiaries.forEach(d => map.set(d.id || d.date, d));
          firestoreDiaries.forEach(d => map.set(d.id || d.date, d));
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `diaries`);
      }
    }

    // Try Backend server read
    try {
      const res = await fetch(`/api/diaries?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.diaries)) {
          const backendDiaries = data.diaries;
          const merged = [...localDiaries];
          
          backendDiaries.forEach((bd: DiaryEntry) => {
            if (!merged.find(md => md.id === bd.id || md.date === bd.date)) {
              merged.push(bd);
            }
          });
          
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.warn('Backend diaries fetch failed, using local fallback:', err);
    }

    return localDiaries;
  },

  async addDiary(entry: Omit<DiaryEntry, 'userId'>, userId?: string): Promise<DiaryEntry> {
    const uid = userId || getUserId();
    const newEntry: DiaryEntry = {
      ...entry,
      id: entry.id || 'diary_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
      userId: uid,
      createdAt: entry.createdAt || new Date().toISOString()
    };

    // Update Local Storage
    const existing = await this.getDiaries(uid);
    const filtered = existing.filter(d => d.id !== newEntry.id);
    const updated = [newEntry, ...filtered];
    localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(updated));
    localStorage.setItem('mystair_diaries', JSON.stringify(updated));

    // Try Firestore save
    if (db) {
      try {
        const docRef = doc(db, 'diaries', newEntry.id);
        await setDoc(docRef, newEntry, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `diaries/${newEntry.id}`);
      }
    }

    // Try Backend server save
    try {
      const res = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, diary: newEntry })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.diary) return result.diary;
      }
    } catch (err) {
      console.warn('Backend diary save failed, stored locally:', err);
    }

    return newEntry;
  },

  async deleteDiary(diaryId: string, userId?: string): Promise<boolean> {
    const uid = userId || getUserId();

    // Local update
    const existing = await this.getDiaries(uid);
    const updated = existing.filter(d => d.id !== diaryId);
    localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(updated));

    // Firestore delete
    if (db) {
      try {
        await deleteDoc(doc(db, 'diaries', diaryId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `diaries/${diaryId}`);
      }
    }

    try {
      const res = await fetch(`/api/diaries/${encodeURIComponent(diaryId)}?userId=${encodeURIComponent(uid)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend diary delete failed:', err);
      return true;
    }
  }
};
