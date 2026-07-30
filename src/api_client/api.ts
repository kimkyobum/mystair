export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  highSchool?: string;
  major?: string;
  mbti?: string;
  hollandCode?: string;
  targetCompanies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  createdAt?: string;
}

const getUserId = (): string => {
  try {
    const mockSaved = localStorage.getItem('mystair_mock_user');
    if (mockSaved) {
      const parsed = JSON.parse(mockSaved);
      if (parsed?.uid) return parsed.uid;
    }
    const saved = localStorage.getItem('mystair_local_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.uid) return parsed.uid;
    }
  } catch (e) {
    console.error(e);
  }
  let localId = localStorage.getItem('mystair_user_id');
  if (!localId) {
    localId = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('mystair_user_id', localId);
  }
  return localId;
};

export const apiService = {
  // 1. 프로필 API
  async getProfile(userId?: string): Promise<UserProfileData | null> {
    const uid = userId || getUserId();
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(data.profile));
          return data.profile;
        }
      }
    } catch (err) {
      console.warn('Backend profile fetch failed, using local fallback:', err);
    }
    
    // Local fallback
    const saved = localStorage.getItem(`mystair_local_user_profile_${uid}`);
    return saved ? JSON.parse(saved) : null;
  },

  async updateProfile(profileData: Partial<UserProfileData>, userId?: string): Promise<UserProfileData> {
    const uid = userId || profileData.uid || getUserId();
    const payload = { ...profileData, uid };

    // Update Local Storage
    localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(payload));

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
      console.warn('Backend profile update failed, saved to local storage:', err);
    }

    return payload as UserProfileData;
  },

  // 2. 다이어리 API
  async getDiaries(userId?: string): Promise<DiaryEntry[]> {
    const uid = userId || getUserId();
    try {
      const res = await fetch(`/api/diaries?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.diaries)) {
          localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(data.diaries));
          return data.diaries;
        }
      }
    } catch (err) {
      console.warn('Backend diaries fetch failed, using local fallback:', err);
    }

    const saved = localStorage.getItem(`mystair_local_diaries_${uid}`);
    return saved ? JSON.parse(saved) : [];
  },

  async addDiary(entry: Omit<DiaryEntry, 'id' | 'userId'>, userId?: string): Promise<DiaryEntry> {
    const uid = userId || getUserId();
    const newEntry: DiaryEntry = {
      ...entry,
      id: 'diary_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
      userId: uid,
      createdAt: new Date().toISOString()
    };

    // Update Local Storage
    const existing = await this.getDiaries(uid);
    const updated = [newEntry, ...existing];
    localStorage.setItem(`mystair_local_diaries_${uid}`, JSON.stringify(updated));

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
