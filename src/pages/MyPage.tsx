import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  School, 
  GraduationCap, 
  Brain, 
  Compass, 
  Building2, 
  Edit3, 
  Check, 
  Plus, 
  X, 
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  Sliders,
  Palette,
  Camera,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileText,
  Bot
} from 'lucide-react';
import { mbtiMeta } from '../data/mbtiData';
import { hollandMeta } from '../data/hollandData';
import { searchMeisterSchools, MeisterSchool } from '../data/meisterSchools';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

interface MyProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
  highSchool: string;
  major: string;
  mbti: string;
  hollandCode: string;
  hollandNote: string;
  targetCompanies: string[];
}

const PRESET_MAJORS = [
  '로봇제어과',
  '전자제어과',
  '정밀기계과',
  '소프트웨어과',
  '전기제어과',
  'AI융합과',
  '바이오의약과',
  '자동화설비과'
];

const POPULAR_COMPANIES = [
  '삼성전자',
  '현대자동차',
  '한국전력공사',
  'SK하이닉스',
  'POSCO',
  '한화시스템',
  'LG에너지솔루션',
  'NAVER',
  '한국수력원자력',
  'LG디스플레이',
  '두산에너빌리티',
  '한국가스공사'
];

export default function MyPage() {
  const { user, userProfile: firestoreProfile, updateProfileInFirestore } = useAuth();
  const { showAliens, setShowAliens } = useChat();
  const { language, setLanguage, t } = useLanguage();
  const { isLightMode, setIsLightMode, setBackgroundType, isClickEffectEnabled, setIsClickEffectEnabled } = useTheme();

  // Active Tab: 'profile' | 'aptitude' | 'companies' | 'settings'
  const [activeTab, setActiveTab] = useState<'profile' | 'aptitude' | 'companies' | 'settings'>('profile');

  // Full Edit Mode (Personal & Academic Info)
  const [isFullEditing, setIsFullEditing] = useState(false);

  // Search & Inputs
  const [tempName, setTempName] = useState('');
  const [tempSchool, setTempSchool] = useState('');
  const [tempMajor, setTempMajor] = useState('');
  const [tempMbti, setTempMbti] = useState('');
  const [tempHolland, setTempHolland] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Modals for deep analysis
  const [activeModal, setActiveModal] = useState<'mbti' | 'holland' | 'companies' | null>(null);

  // Main Profile State
  const [profile, setProfile] = useState<MyProfileData>({
    name: '',
    email: '',
    avatarUrl: '',
    highSchool: '',
    major: '',
    mbti: '',
    hollandCode: '',
    hollandNote: '',
    targetCompanies: []
  });

  // Stored test results
  const [mbtiResult, setMbtiResult] = useState<any>(null);
  const [hollandResult, setHollandResult] = useState<any>(null);

  const getActiveUid = () => {
    if (user?.uid) return user.uid;
    if (user?.email) return 'user_' + user.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
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

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Load initial data
  const loadData = () => {
    const uid = getActiveUid();

    let baseName = firestoreProfile?.name || user?.displayName || '';
    let baseEmail = firestoreProfile?.email || user?.email || '';
    let baseAvatarUrl = firestoreProfile?.avatarUrl || user?.photoURL || '';

    const savedSidebarProfile = localStorage.getItem(`mystair_user_profile_${uid}`);
    if (savedSidebarProfile) {
      try {
        const parsed = JSON.parse(savedSidebarProfile);
        if (parsed.name && !baseName) baseName = parsed.name;
        if (parsed.email && !baseEmail) baseEmail = parsed.email;
        if (parsed.avatarUrl && !baseAvatarUrl) baseAvatarUrl = parsed.avatarUrl;
      } catch (e) {}
    }

    const savedMockUser = localStorage.getItem('mystair_mock_user');
    if (savedMockUser) {
      try {
        const parsedMock = JSON.parse(savedMockUser);
        if (parsedMock.photoURL && !baseAvatarUrl) baseAvatarUrl = parsedMock.photoURL;
        if (parsedMock.displayName && !baseName) baseName = parsedMock.displayName;
      } catch (e) {}
    }

    let currentProfile: MyProfileData = {
      name: baseName,
      email: baseEmail,
      avatarUrl: baseAvatarUrl,
      highSchool: firestoreProfile?.highSchool || '',
      major: firestoreProfile?.major || '',
      mbti: firestoreProfile?.mbti || '',
      hollandCode: firestoreProfile?.hollandCode || '',
      hollandNote: firestoreProfile?.hollandNote || '',
      targetCompanies: (firestoreProfile?.targetCompanies && firestoreProfile.targetCompanies.length > 0) ? firestoreProfile.targetCompanies : []
    };

    const savedMyPage = localStorage.getItem(`mystair_mypage_data_${uid}`);
    if (savedMyPage) {
      try {
        const parsed = JSON.parse(savedMyPage);
        currentProfile = {
          ...currentProfile,
          ...parsed,
          name: parsed.name || currentProfile.name,
          email: parsed.email || currentProfile.email,
          avatarUrl: parsed.avatarUrl || currentProfile.avatarUrl,
          highSchool: parsed.highSchool || currentProfile.highSchool,
          major: parsed.major || currentProfile.major,
          mbti: parsed.mbti || currentProfile.mbti,
          hollandCode: parsed.hollandCode || currentProfile.hollandCode,
          targetCompanies: (parsed.targetCompanies && parsed.targetCompanies.length > 0) ? parsed.targetCompanies : currentProfile.targetCompanies
        };
      } catch (e) {}
    }

    const savedMbti = localStorage.getItem(`mystair_mbti_result_${uid}`);
    if (savedMbti) {
      try {
        const parsed = JSON.parse(savedMbti);
        setMbtiResult(parsed);
        if (parsed.baseType && !currentProfile.mbti) {
          currentProfile.mbti = parsed.baseType;
        }
      } catch (e) {}
    }

    const savedHolland = localStorage.getItem(`mystair_holland_result_${uid}`);
    if (savedHolland) {
      try {
        const parsed = JSON.parse(savedHolland);
        setHollandResult(parsed);
        if (parsed.topCode && !currentProfile.hollandCode) {
          currentProfile.hollandCode = parsed.topCode;
        }
      } catch (e) {}
    }

    setProfile(currentProfile);
    setTempName(currentProfile.name);
    setTempSchool(currentProfile.highSchool);
    setTempMajor(currentProfile.major);
    setTempMbti(currentProfile.mbti);
    setTempHolland(currentProfile.hollandCode);
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, firestoreProfile]);

  // Auto-save on page unmount
  useEffect(() => {
    return () => {
      const uid = getActiveUid();
      const p = profileRef.current;
      if (p && (p.name || p.highSchool || p.major || p.mbti || p.hollandCode)) {
        try {
          localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(p));
          localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(p));
          localStorage.setItem(`mystair_user_profile_${uid}`, JSON.stringify({
            name: p.name,
            email: p.email,
            avatarUrl: p.avatarUrl
          }));
          updateProfileInFirestore(p);
        } catch (e) {}
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        showToast(t('이미지 크기가 너무 큽니다 (1.5MB 이하만 가능합니다)'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        savePartialField('avatarUrl', base64String, t('프로필 사진'));
      };
      reader.readAsDataURL(file);
    }
  };

  const savePartialField = async (key: keyof MyProfileData, val: any, fieldLabel: string) => {
    const uid = getActiveUid();
    const updated = { ...profile, [key]: val };
    setProfile(updated);
    try {
      localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(updated));
      localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(updated));
      if (key === 'name' || key === 'email' || key === 'avatarUrl') {
        localStorage.setItem(`mystair_user_profile_${uid}`, JSON.stringify({
          name: key === 'name' ? val : profile.name,
          email: key === 'email' ? val : profile.email,
          avatarUrl: key === 'avatarUrl' ? val : profile.avatarUrl
        }));
      }
      await updateProfileInFirestore({ [key]: val });
      showToast(`${fieldLabel} ${t('정보가 저장되었습니다.')}`);
    } catch (e) {
      showToast(t('저장 중 오류가 발생했습니다.'));
    }
  };

  const handleSaveProfile = async () => {
    const uid = getActiveUid();
    const updated: MyProfileData = {
      ...profile,
      name: tempName.trim() || profile.name,
      highSchool: tempSchool.trim() || profile.highSchool,
      major: tempMajor.trim() || profile.major
    };
    setProfile(updated);
    try {
      localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(updated));
      localStorage.setItem(`mystair_local_user_profile_${uid}`, JSON.stringify(updated));
      localStorage.setItem(`mystair_user_profile_${uid}`, JSON.stringify({
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl
      }));
      await updateProfileInFirestore(updated);
      showToast(t('프로필 정보가 저장되었습니다.'));
      setIsFullEditing(false);
    } catch (e) {
      showToast(t('저장 중 오류가 발생했습니다.'));
    }
  };

  const handleAddCompany = (companyName?: string) => {
    const target = (companyName || newCompanyInput).trim();
    if (!target) return;
    if (profile.targetCompanies.includes(target)) {
      showToast(t('이미 희망 기업에 포함되어 있습니다.'));
      return;
    }
    const updatedCompanies = [...profile.targetCompanies, target];
    savePartialField('targetCompanies', updatedCompanies, t('희망 기업'));
    if (!companyName) setNewCompanyInput('');
  };

  const handleRemoveCompany = (companyName: string) => {
    const updatedCompanies = profile.targetCompanies.filter(c => c !== companyName);
    savePartialField('targetCompanies', updatedCompanies, t('희망 기업'));
  };

  const currentMbtiMeta = profile.mbti ? mbtiMeta[profile.mbti] : null;
  const modalMbtiMeta = currentMbtiMeta || mbtiMeta['ISTJ'];
  const firstHollandChar = profile.hollandCode?.[0];
  const secondHollandChar = profile.hollandCode?.[1];
  const primaryHollandMeta = firstHollandChar ? hollandMeta[firstHollandChar] : null;
  const secondaryHollandMeta = secondHollandChar ? hollandMeta[secondHollandChar] : null;
  const modalPrimaryHollandMeta = primaryHollandMeta || hollandMeta['R'];
  const modalSecondaryHollandMeta = secondaryHollandMeta || hollandMeta['C'];

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden font-sans flex flex-col relative pb-28 ${isLightMode ? "bg-slate-50/60 text-slate-900" : "bg-slate-950/40 text-slate-100"}`}>
      
      {/* Top Header Bar */}
      <header className={`backdrop-blur-md border-b h-16 w-full flex items-center justify-between px-5 sm:px-10 sticky top-0 z-40 transition-colors ${
        isLightMode ? "bg-white/85 border-slate-200/80 text-slate-900" : "bg-slate-900/80 border-slate-800 text-white"
      }`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
            MyStair
          </Link>
          <span className="text-slate-400 font-light">/</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
            {t('마이페이지')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className={`border rounded-lg px-3 py-1 text-xs font-semibold outline-none transition cursor-pointer ${
              isLightMode 
                ? "bg-white border-slate-300 text-slate-800 hover:border-slate-400" 
                : "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600"
            }`}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-7 space-y-6 relative z-10">

        {/* ================= HERO PROFILE CARD (YouTube & Instagram Inspired) ================= */}
        <section className={`rounded-2xl border p-6 sm:p-7 shadow-xs transition-all ${
          isLightMode 
            ? "bg-white border-slate-200/90 text-slate-900" 
            : "bg-slate-900/80 border-slate-800 text-white"
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Identity & Avatar */}
            <div className="flex items-center gap-5 min-w-0">
              {/* Refined Avatar */}
              <div className="relative group shrink-0">
                <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 p-0.5 transition-all ${
                  isLightMode ? "border-slate-200 bg-slate-100" : "border-slate-700 bg-slate-800"
                }`}>
                  {(profile.avatarUrl || firestoreProfile?.avatarUrl || user?.photoURL) ? (
                    <img 
                      src={profile.avatarUrl || firestoreProfile?.avatarUrl || user?.photoURL || ''} 
                      alt={t('프로필 사진')} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                      <User size={38} className="text-slate-400" />
                    </div>
                  )}

                  {/* Photo Edit Overlay */}
                  <label className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={18} />
                    <span>{t('사진 변경')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Names and Status */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate tour-target-profile-header-name">
                    {profile.name || t('마이스터 학생')}
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                    {t('마이스터 인재')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {profile.highSchool || t('마이스터고 미설정')}
                  </span>
                  <span>•</span>
                  <span>{profile.major || t('전공 미설정')}</span>
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {profile.email || user?.email || t('이메일 정보 없음')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto self-end md:self-auto shrink-0">
              <button
                onClick={() => {
                  if (isFullEditing) {
                    handleSaveProfile();
                  } else {
                    setTempName(profile.name);
                    setTempSchool(profile.highSchool);
                    setTempMajor(profile.major);
                    setIsFullEditing(true);
                    setActiveTab('profile');
                  }
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs tour-target-edit-mode ${
                  isFullEditing
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : isLightMode
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "bg-white hover:bg-slate-100 text-slate-900"
                }`}
              >
                {isFullEditing ? <Check size={14} /> : <Edit3 size={14} />}
                <span>{isFullEditing ? t('저장 완료') : t('프로필 편집')}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  activeTab === 'settings'
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                    : isLightMode
                      ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                <Settings size={14} />
                <span>{t('환경 설정')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar (Instagram Profile Stats Style) */}
          <div className={`mt-6 pt-5 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 ${
            isLightMode ? "border-slate-100" : "border-slate-800/80"
          }`}>
            {/* Metric 1: 학적 정보 */}
            <div 
              onClick={() => { setActiveTab('profile'); }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <School size={12} />
                <span>{t('고등학교')}</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {profile.highSchool ? profile.highSchool.replace('고등학교', '고') : t('미등록')}
              </div>
            </div>

            {/* Metric 2: MBTI */}
            <div 
              onClick={() => { setActiveTab('aptitude'); }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Brain size={12} />
                <span>{t('MBTI 진단')}</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {profile.mbti ? `${profile.mbti} (${currentMbtiMeta?.alias || ''})` : t('미진단')}
              </div>
            </div>

            {/* Metric 3: 홀랜드 */}
            <div 
              onClick={() => { setActiveTab('aptitude'); }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass size={12} />
                <span>{t('홀랜드 적성')}</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {profile.hollandCode ? `${profile.hollandCode}형` : t('미진단')}
              </div>
            </div>

            {/* Metric 4: 목표 기업 */}
            <div 
              onClick={() => { setActiveTab('companies'); }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 size={12} />
                <span>{t('희망 기업')}</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {profile.targetCompanies.length > 0 ? `${profile.targetCompanies.length}${t('개 등록')}` : t('0개 등록')}
              </div>
            </div>
          </div>
        </section>

        {/* ================= HORIZONTAL NAVIGATION TABS ================= */}
        <div className={`flex items-center gap-2 border-b overflow-x-auto no-scrollbar ${
          isLightMode ? "border-slate-200" : "border-slate-800"
        }`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer tour-target-tab-profile ${
              activeTab === 'profile'
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <User size={15} />
            <span>{t('기본 정보 & 학적')}</span>
          </button>

          <button
            onClick={() => setActiveTab('aptitude')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer tour-target-tab-aptitude ${
              activeTab === 'aptitude'
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Brain size={15} />
            <span>{t('진로 적성 진단')}</span>
            {(profile.mbti || profile.hollandCode) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer tour-target-tab-companies ${
              activeTab === 'companies'
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Building2 size={15} />
            <span>{t('희망 목표 기업')}</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'companies' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}>
              {profile.targetCompanies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer tour-target-tab-settings ${
              activeTab === 'settings'
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Settings size={15} />
            <span>{t('환경 설정')}</span>
          </button>
        </div>

        {/* ================= TAB 1: 기본 정보 & 학적 ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Structured Card: Personal & Academic Information */}
            <div className={`rounded-2xl border p-6 shadow-xs ${
              isLightMode ? "bg-white border-slate-200/90" : "bg-slate-900/80 border-slate-800"
            }`}>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 tour-target-profile-academic">
                <div className="flex items-center gap-2">
                  <School size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('학적 및 기본 프로필')}
                  </h2>
                </div>

                {isFullEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(profile.name);
                        setTempSchool(profile.highSchool);
                        setTempMajor(profile.major);
                        setIsFullEditing(false);
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        isLightMode 
                          ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" 
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                    >
                      {t('취소')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Check size={14} />
                      <span>{t('저장')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempName(profile.name);
                      setTempSchool(profile.highSchool);
                      setTempMajor(profile.major);
                      setIsFullEditing(true);
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>{t('수정하기')}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
                
                {/* Field 1: Name */}
                <div className="space-y-1.5 tour-target-profile-name">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('이름')}
                  </label>
                  {isFullEditing ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      placeholder={t('이름 입력')}
                      className={`w-full border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none transition ${
                        isLightMode 
                          ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" 
                          : "bg-slate-800 border-slate-700 text-white focus:border-emerald-400"
                      }`}
                    />
                  ) : (
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 py-1">
                      {profile.name || t('이름 미입력')}
                    </div>
                  )}
                </div>

                {/* Field 2: Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('계정 이메일')}
                  </label>
                  <div className="text-base font-semibold text-slate-700 dark:text-slate-300 py-1 truncate">
                    {profile.email || user?.email || t('이메일 정보 없음')}
                  </div>
                </div>

                {/* Field 3: High School */}
                <div className="space-y-1.5 relative tour-target-profile-school sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {t('재학 / 졸업 마이스터고등학교')}
                    </label>
                    {isFullEditing && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        {t('전국 58개 마이스터고 실시간 검색')}
                      </span>
                    )}
                  </div>

                  {isFullEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={tempSchool}
                        onFocus={() => setIsSchoolDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsSchoolDropdownOpen(false), 200)}
                        onChange={e => {
                          setTempSchool(e.target.value);
                          setIsSchoolDropdownOpen(true);
                        }}
                        placeholder={t('학교명을 입력하세요 (예: 구미전자공고, 수도전기, 로봇 등)')}
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none transition ${
                          isLightMode 
                            ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" 
                            : "bg-slate-800 border-slate-700 text-white focus:border-emerald-400"
                        }`}
                      />

                      {/* Meister School Auto-complete Dropdown */}
                      {isSchoolDropdownOpen && (
                        <div 
                          className={`absolute left-0 right-0 top-full mt-1 rounded-xl shadow-xl border z-50 max-h-56 overflow-y-auto divide-y ${
                            isLightMode ? "bg-white border-slate-200 divide-slate-100" : "bg-slate-900 border-slate-700 divide-slate-800 text-white"
                          }`}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <div className={`px-3 py-1.5 text-[11px] font-bold sticky top-0 flex items-center justify-between ${
                            isLightMode ? "bg-slate-50 text-slate-500" : "bg-slate-800 text-slate-400"
                          }`}>
                            <span>{t('마이스터고 목록')} ({searchMeisterSchools(tempSchool).length}개)</span>
                            <span className="text-[10px] text-emerald-500">{t('선택 시 자동 입력')}</span>
                          </div>

                          {searchMeisterSchools(tempSchool).length > 0 ? (
                            searchMeisterSchools(tempSchool).map(sch => (
                              <button
                                key={sch.id}
                                type="button"
                                onClick={() => {
                                  setTempSchool(sch.name);
                                  setIsSchoolDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                                  isLightMode ? "hover:bg-emerald-50/70" : "hover:bg-slate-800"
                                }`}
                              >
                                <span className="font-bold">{sch.name}</span>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    {sch.region}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium">
                                    {sch.field}
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-xs text-slate-400">
                              {t('일치하는 마이스터고가 없습니다. 직접 입력할 수 있습니다.')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Meister High School Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">{t('추천')}:</span>
                        {['구미전자공업고등학교', '수도전기공업고등학교', '서울로봇고등학교', '부산기계공업고등학교'].map(sch => (
                          <button
                            key={sch}
                            type="button"
                            onClick={() => {
                              setTempSchool(sch);
                              setIsSchoolDropdownOpen(false);
                            }}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition cursor-pointer border ${
                              tempSchool === sch 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300"
                                : isLightMode 
                                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" 
                                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                            }`}
                          >
                            {sch.replace('고등학교', '고')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 py-1">
                      {profile.highSchool || t('고등학교 정보 미등록')}
                    </div>
                  )}
                </div>

                {/* Field 4: Major */}
                <div className="space-y-1.5 tour-target-profile-major sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('전공 학과')}
                  </label>

                  {isFullEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tempMajor}
                        onChange={e => setTempMajor(e.target.value)}
                        placeholder={t('전공 학과명을 입력하세요 (예: 전자제어과, 소프트웨어과)')}
                        className={`w-full border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none transition ${
                          isLightMode 
                            ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" 
                            : "bg-slate-800 border-slate-700 text-white focus:border-emerald-400"
                        }`}
                      />

                      {/* Major Preset Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 self-center">{t('학과 프리셋')}:</span>
                        {PRESET_MAJORS.map(maj => (
                          <button
                            key={maj}
                            type="button"
                            onClick={() => setTempMajor(maj)}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition cursor-pointer border ${
                              tempMajor === maj 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300"
                                : isLightMode 
                                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" 
                                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                            }`}
                          >
                            {maj}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 py-1">
                      {profile.major || t('전공 학과 미등록')}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Action if Editing */}
              {isFullEditing && (
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(profile.name);
                      setTempSchool(profile.highSchool);
                      setTempMajor(profile.major);
                      setIsFullEditing(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isLightMode ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                  >
                    {t('취소')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    {t('변경사항 저장')}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: 진로 적성 진단 (MBTI & Holland) ================= */}
        {activeTab === 'aptitude' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* MBTI Card */}
              <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-5 tour-target-profile-mbti ${
                isLightMode ? "bg-white border-slate-200/90" : "bg-slate-900/80 border-slate-800"
              }`}>
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Brain size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('MBTI 성격 유형 진단')}
                      </h3>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {profile.mbti ? profile.mbti : t('미진단')}
                    </span>
                  </div>

                  {profile.mbti ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                          {profile.mbti}
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {currentMbtiMeta?.alias}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {currentMbtiMeta?.desc}
                        </p>
                      </div>

                      {/* Trait Ratios breakdown if available */}
                      {mbtiResult?.ratios && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {t('세부 성향 지표')}
                          </div>
                          <div className="space-y-1.5">
                            {Object.keys(mbtiResult.ratios).slice(0, 4).map(k => {
                              const item = mbtiResult.ratios[k];
                              return (
                                <div key={k} className="text-xs">
                                  <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all"
                                      style={{ width: `${item.val}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommended Jobs */}
                      {currentMbtiMeta?.jobs && (
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {t('추천 직무/분야')}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentMbtiMeta.jobs.slice(0, 4).map((job: string) => (
                              <span 
                                key={job}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {job}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Brain size={24} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('아직 MBTI 성격 진단 검사를 진행하지 않았습니다.')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    to="/mbti"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{profile.mbti ? t('검사 다시하기') : t('검사 진행하기')}</span>
                    <ExternalLink size={12} />
                  </Link>

                  {profile.mbti && (
                    <button
                      onClick={() => setActiveModal('mbti')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        isLightMode ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                    >
                      {t('상세 분석 보기')}
                    </button>
                  )}
                </div>
              </div>

              {/* Holland Card */}
              <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-5 tour-target-profile-holland ${
                isLightMode ? "bg-white border-slate-200/90" : "bg-slate-900/80 border-slate-800"
              }`}>
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Compass size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('홀랜드 직업 적성 검사')}
                      </h3>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {profile.hollandCode ? `${profile.hollandCode}형` : t('미진단')}
                    </span>
                  </div>

                  {profile.hollandCode ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                          {profile.hollandCode}형
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {primaryHollandMeta?.name} & {secondaryHollandMeta?.name}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {primaryHollandMeta?.desc}
                        </p>
                      </div>

                      {/* RIASEC Percentages if available */}
                      {hollandResult?.percentages && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {t('RIASEC 적합도 지표')}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.keys(hollandResult.percentages).map(k => {
                              const val = hollandResult.percentages[k];
                              return (
                                <div key={k} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-center">
                                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{k}</div>
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{val}%</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Holland Guidance Note */}
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          {t('진로 지도 소견 메모')}
                        </div>
                        <textarea
                          value={profile.hollandNote}
                          onChange={e => setProfile({ ...profile, hollandNote: e.target.value })}
                          rows={2}
                          placeholder={t('진로 관련 메모나 목표를 기록하세요.')}
                          className={`w-full border rounded-xl p-2.5 text-xs font-medium outline-none transition ${
                            isLightMode 
                              ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600" 
                              : "bg-slate-800/80 border-slate-700 text-slate-200 focus:border-emerald-400"
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Compass size={24} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('아직 홀랜드 직업 적성 검사를 진행하지 않았습니다.')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    to="/holland"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{profile.hollandCode ? t('검사 다시하기') : t('검사 진행하기')}</span>
                    <ExternalLink size={12} />
                  </Link>

                  {profile.hollandCode && (
                    <button
                      onClick={() => setActiveModal('holland')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        isLightMode ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                    >
                      {t('상세 분석 보기')}
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 3: 희망 목표 기업 ================= */}
        {activeTab === 'companies' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className={`rounded-2xl border p-6 shadow-xs space-y-6 tour-target-profile-company ${
              isLightMode ? "bg-white border-slate-200/90" : "bg-slate-900/80 border-slate-800"
            }`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t('희망 목표 기업 관리')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('마이스터고 취업 준비를 위해 관심 있는 공기업, 대기업 및 강소기업을 등록하세요.')}
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
                  {profile.targetCompanies.length}{t('개 등록됨')}
                </span>
              </div>

              {/* Direct Add Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('직접 기업 추가')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCompanyInput}
                    onChange={e => setNewCompanyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCompany())}
                    placeholder={t('기업명을 입력하세요 (예: 삼성전자, 한국전력공사, NAVER)')}
                    className={`flex-1 border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none transition ${
                      isLightMode 
                        ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" 
                        : "bg-slate-800 border-slate-700 text-white focus:border-emerald-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCompany()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus size={15} />
                    <span>{t('추가')}</span>
                  </button>
                </div>
              </div>

              {/* Registered Companies Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('등록된 목표 기업 목록')}
                </label>

                <div className={`p-4 rounded-xl border min-h-[72px] flex flex-wrap gap-2 items-center ${
                  isLightMode ? "bg-slate-50/70 border-slate-200" : "bg-slate-800/40 border-slate-800"
                }`}>
                  {profile.targetCompanies.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      {t('등록된 희망 기업이 없습니다. 아래 추천 기업을 클릭하거나 위에서 직접 입력해보세요.')}
                    </span>
                  ) : (
                    profile.targetCompanies.map(comp => (
                      <div 
                        key={comp}
                        className={`font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 border shadow-2xs transition ${
                          isLightMode 
                            ? "bg-white text-slate-800 border-slate-200" 
                            : "bg-slate-800 text-slate-200 border-slate-700"
                        }`}
                      >
                        <Building2 size={13} className="text-emerald-500" />
                        <span>{comp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCompany(comp)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer ml-0.5"
                          title={t('삭제')}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Curated Popular Meister Companies */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('마이스터고 추천 인기 파트너 기업')}
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t('클릭 시 바로 추가/삭제')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COMPANIES.map(comp => {
                    const isAdded = profile.targetCompanies.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => isAdded ? handleRemoveCompany(comp) : handleAddCompany(comp)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                          isAdded
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-300"
                            : isLightMode
                              ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                        }`}
                      >
                        {isAdded ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Plus size={12} className="text-slate-400" />}
                        <span>{comp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 4: 환경 및 테마 설정 ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
            
            {/* Main Settings Card */}
            <div className={`rounded-2xl border p-6 sm:p-7 shadow-xs space-y-7 tour-target-settings-card ${
              isLightMode ? "bg-white border-slate-200/90" : "bg-slate-900/80 border-slate-800"
            }`}>
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Palette size={18} />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {t('화면 및 인터랙션 환경 설정')}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('화면 테마와 시각적 인터랙션 효과를 원하는 대로 맞춤 설정할 수 있습니다.')}
                  </p>
                </div>
                <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('실시간 자동 저장')}
                </span>
              </div>

              {/* Section 1: Visual Theme Cards */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {t('화면 테마')}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {isLightMode ? t('현재: 라이트 모드') : t('현재: 우주 다크 모드')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Light Mode */}
                  <div
                    onClick={() => setIsLightMode(true)}
                    className={`group relative rounded-2xl border-2 p-4 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isLightMode 
                        ? "border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-600/10" 
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Visual Mini Preview */}
                    <div className="w-full h-24 rounded-xl bg-white border border-slate-200/80 p-2.5 flex flex-col gap-1.5 shadow-2xs mb-3.5 transition group-hover:scale-[1.01]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="w-12 h-2 rounded bg-slate-100"></div>
                      </div>
                      <div className="flex gap-2 flex-1 pt-1">
                        <div className="w-1/4 rounded bg-slate-50 border border-slate-100 p-1 flex flex-col gap-1">
                          <div className="w-full h-1.5 rounded bg-emerald-100"></div>
                          <div className="w-2/3 h-1.5 rounded bg-slate-100"></div>
                        </div>
                        <div className="flex-1 rounded bg-slate-50 border border-slate-100 p-1.5 flex flex-col justify-between">
                          <div className="w-3/4 h-2 rounded bg-slate-200"></div>
                          <div className="w-1/2 h-1.5 rounded bg-slate-100"></div>
                        </div>
                      </div>
                    </div>

                    {/* Content Label */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl transition ${
                          isLightMode ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}>
                          <Sun size={17} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('라이트 모드 (화이트)')}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('눈이 편안하고 선명한 기본 화이트 테마')}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                        isLightMode ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {isLightMode && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>

                  {/* Option B: Space Dark Mode */}
                  <div
                    onClick={() => {
                      setIsLightMode(false);
                      setBackgroundType('black');
                    }}
                    className={`group relative rounded-2xl border-2 p-4 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                      !isLightMode 
                        ? "border-emerald-500 bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/10" 
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Visual Mini Preview */}
                    <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 p-2.5 flex flex-col gap-1.5 shadow-2xs mb-3.5 transition group-hover:scale-[1.01] relative overflow-hidden">
                      {/* Decorative starry effect */}
                      <div className="absolute top-2 right-4 w-1 h-1 rounded-full bg-emerald-400 opacity-60"></div>
                      <div className="absolute bottom-3 left-6 w-1 h-1 rounded-full bg-white opacity-40"></div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-rose-500/70"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-500/70"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500/70"></div>
                        </div>
                        <div className="w-12 h-2 rounded bg-slate-800"></div>
                      </div>
                      <div className="flex gap-2 flex-1 pt-1">
                        <div className="w-1/4 rounded bg-slate-900 border border-slate-800 p-1 flex flex-col gap-1">
                          <div className="w-full h-1.5 rounded bg-emerald-500/40"></div>
                          <div className="w-2/3 h-1.5 rounded bg-slate-800"></div>
                        </div>
                        <div className="flex-1 rounded bg-slate-900 border border-slate-800 p-1.5 flex flex-col justify-between">
                          <div className="w-3/4 h-2 rounded bg-slate-700"></div>
                          <div className="w-1/2 h-1.5 rounded bg-slate-800"></div>
                        </div>
                      </div>
                    </div>

                    {/* Content Label */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl transition ${
                          !isLightMode ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}>
                          <Moon size={17} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('우주 모드 (다크)')}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('신비롭고 차분한 밤하늘 별빛 테마')}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                        !isLightMode ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {!isLightMode && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Unified Interactive Preferences (iOS-style Clean List) */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('상호작용 및 시각 효과')}
                </label>

                <div className={`rounded-2xl border divide-y overflow-hidden transition-colors ${
                  isLightMode 
                    ? "bg-slate-50/60 border-slate-200/90 divide-slate-200/80" 
                    : "bg-slate-800/40 border-slate-800 divide-slate-800/80"
                }`}>
                  {/* Row 1: Alien AI Assistant */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Bot size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {t('인공지능 도우미 외계인 안내')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('화면 우측 하단에서 실시간 조언 및 대화를 돕는 외계인 캐릭터를 표시합니다.')}
                        </div>
                      </div>
                    </div>

                    {/* Smooth Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showAliens}
                      onClick={() => setShowAliens(!showAliens)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showAliens ? "bg-emerald-600" : isLightMode ? "bg-slate-300" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          showAliens ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 2: Touch & Click Particle Effect */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Sparkles size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {t('화면 클릭 / 터치 별빛 파티클 효과')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t('마우스 클릭이나 화면 터치 시 은은하고 아름다운 별빛 파티클 애니메이션을 생성합니다.')}
                        </div>
                      </div>
                    </div>

                    {/* Smooth Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isClickEffectEnabled}
                      onClick={() => setIsClickEffectEnabled(!isClickEffectEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isClickEffectEnabled ? "bg-emerald-600" : isLightMode ? "bg-slate-300" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isClickEffectEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL 1: MBTI Detail Analysis Modal ================= */}
      {activeModal === 'mbti' && (
        <div className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 animate-in fade-in duration-150">
          <div className={`w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl border relative space-y-5 my-auto ${
            isLightMode ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-white border-slate-700"
          }`}>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1.5 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Brain size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('MBTI 성격 유형 상세 분석')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('성격 특성 및 맞춤형 직무 추천 가이드')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {profile.mbti || 'ISTJ'}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      ({modalMbtiMeta.alias})
                    </span>
                  </div>

                  <select
                    value={profile.mbti}
                    onChange={e => savePartialField('mbti', e.target.value, 'MBTI')}
                    className={`border rounded-lg px-2 py-1 text-xs font-bold outline-none ${
                      isLightMode ? "bg-white border-slate-300 text-slate-900" : "bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    {Object.keys(mbtiMeta).map(type => (
                      <option key={type} value={type}>
                        {type} - {mbtiMeta[type].alias}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {modalMbtiMeta.desc}
                </p>
              </div>

              {/* Trait Ratios */}
              {mbtiResult?.ratios && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('실제 검사 세부 지표')}</div>
                  <div className="space-y-1.5">
                    {Object.keys(mbtiResult.ratios).map(k => {
                      const item = mbtiResult.ratios[k];
                      return (
                        <div key={k} className="text-xs">
                          <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                            <span>{item.label}</span>
                            <span className="font-bold">{item.val}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                              style={{ width: `${item.val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Jobs */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('추천 직무 목록')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {modalMbtiMeta.jobs.map((job: string) => (
                    <span 
                      key={job}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                    >
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/mbti"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{t('검사 다시하기')}</span>
                <ExternalLink size={12} />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                {t('닫기')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: Holland Detail Analysis Modal ================= */}
      {activeModal === 'holland' && (
        <div className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 animate-in fade-in duration-150">
          <div className={`w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl border relative space-y-5 my-auto ${
            isLightMode ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-white border-slate-700"
          }`}>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1.5 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Compass size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('홀랜드 직업 적성 검사 상세')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('RIASEC 직업적성 유형 분석 및 진로 소견')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {profile.hollandCode ? `${profile.hollandCode}형` : '미진단'}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {modalPrimaryHollandMeta.name} & {modalSecondaryHollandMeta.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">1순위: {modalPrimaryHollandMeta.name}</span>
                    <p className="text-slate-600 dark:text-slate-300">{modalPrimaryHollandMeta.desc}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">2순위: {modalSecondaryHollandMeta.name}</span>
                    <p className="text-slate-600 dark:text-slate-300">{modalSecondaryHollandMeta.desc}</p>
                  </div>
                </div>
              </div>

              {/* RIASEC Percentages */}
              {hollandResult?.percentages && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('RIASEC 적합도 지표')}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Object.keys(hollandResult.percentages).map(k => {
                      const val = hollandResult.percentages[k];
                      return (
                        <div key={k} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-center">
                          <span className="font-bold text-slate-500 block">{k}</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{val}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Memo Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('진로 지도 소견 메모')}</label>
                <textarea
                  value={profile.hollandNote}
                  onChange={e => setProfile({ ...profile, hollandNote: e.target.value })}
                  rows={2}
                  className={`w-full border rounded-xl p-2.5 text-xs font-medium outline-none ${
                    isLightMode ? "bg-white border-slate-300 text-slate-900" : "bg-slate-800 border-slate-700 text-white"
                  }`}
                  placeholder={t('진로 소견 메모를 입력하세요.')}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/holland"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{t('검사 다시하기')}</span>
                <ExternalLink size={12} />
              </Link>
              <button
                onClick={() => {
                  const uid = getActiveUid();
                  localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(profile));
                  setActiveModal(null);
                  showToast(t('소견 메모가 저장되었습니다.'));
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {t('저장 후 닫기')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl z-[200] border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
