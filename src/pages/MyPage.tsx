import { useState, useEffect } from 'react';
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
  Sparkles,
  Award,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { mbtiMeta } from '../data/mbtiData';
import { hollandMeta } from '../data/hollandData';
import { useAuth } from '../context/AuthContext';

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

const PRESET_SCHOOLS = [
  '수도전기공업고등학교',
  '서울로봇고등학교',
  '부산기계공업고등학교',
  '동아마이스터고등학교',
  '금오공업고등학교',
  '미림여자정보과학고등학교',
  '광주소프트웨어마이스터고등학교'
];

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
  const { userProfile: firestoreProfile, updateProfileInFirestore } = useAuth();

  const [isFullEditing, setIsFullEditing] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'school' | 'major' | 'mbti' | 'holland' | null>(null);

  // Temporary inputs for inline partial editing
  const [tempName, setTempName] = useState('');
  const [tempSchool, setTempSchool] = useState('');
  const [tempMajor, setTempMajor] = useState('');
  const [tempMbti, setTempMbti] = useState('');
  const [tempHolland, setTempHolland] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Modal State for detail views ('mbti' | 'holland' | 'companies' | null)
  const [activeModal, setActiveModal] = useState<'mbti' | 'holland' | 'companies' | null>(null);

  // Main Profile State
  const [profile, setProfile] = useState<MyProfileData>({
    name: '김계단',
    email: 'meister@mystair.com',
    avatarUrl: '',
    highSchool: '수도전기공업고등학교',
    major: '전기제어과',
    mbti: 'ISTJ',
    hollandCode: 'RC',
    hollandNote: '기계 및 전기 설비 다루기에 강점이 있으며, 규칙적이고 체계적인 현장 관리 직무에 높은 적성을 나타냅니다.',
    targetCompanies: ['한국전력공사', '삼성전자', '현대자동차', '한화시스템']
  });

  // Sync profile from Firestore whenever userProfile updates
  useEffect(() => {
    if (firestoreProfile) {
      setProfile(prev => ({
        ...prev,
        name: firestoreProfile.name || prev.name,
        email: firestoreProfile.email || prev.email,
        avatarUrl: firestoreProfile.avatarUrl || prev.avatarUrl,
        highSchool: firestoreProfile.highSchool || prev.highSchool,
        major: firestoreProfile.major || prev.major,
        mbti: firestoreProfile.mbti || prev.mbti,
        hollandCode: firestoreProfile.hollandCode || prev.hollandCode,
        targetCompanies: firestoreProfile.targetCompanies || prev.targetCompanies
      }));
    }
  }, [firestoreProfile]);

  // Stored test results
  const [mbtiResult, setMbtiResult] = useState<any>(null);
  const [hollandResult, setHollandResult] = useState<any>(null);

  const loadData = () => {
    // 1. Load basic user profile from localStorage if exists
    const savedSidebarProfile = localStorage.getItem('mystair_user_profile');
    let baseName = '김계단';
    let baseEmail = 'meister@mystair.com';
    if (savedSidebarProfile) {
      try {
        const parsed = JSON.parse(savedSidebarProfile);
        if (parsed.name) baseName = parsed.name;
        if (parsed.email) baseEmail = parsed.email;
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load full mypage profile from localStorage
    let currentProfile = {
      name: baseName,
      email: baseEmail,
      avatarUrl: '',
      highSchool: '수도전기공업고등학교',
      major: '전기제어과',
      mbti: 'ISTJ',
      hollandCode: 'RC',
      hollandNote: '기계 및 전기 설비 다루기에 강점이 있으며, 규칙적이고 체계적인 현장 관리 직무에 높은 적성을 나타냅니다.',
      targetCompanies: ['한국전력공사', '삼성전자', '현대자동차', '한화시스템']
    };

    const savedMyPage = localStorage.getItem('mystair_mypage_data');
    if (savedMyPage) {
      try {
        const parsed = JSON.parse(savedMyPage);
        currentProfile = {
          ...currentProfile,
          ...parsed,
          name: parsed.name || baseName,
          email: parsed.email || baseEmail
        };
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Load saved MBTI test results automatically
    const savedMbti = localStorage.getItem('mystair_mbti_result');
    if (savedMbti) {
      try {
        const parsed = JSON.parse(savedMbti);
        setMbtiResult(parsed);
        if (parsed.baseType) {
          currentProfile.mbti = parsed.baseType;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 4. Load saved Holland test results automatically
    const savedHolland = localStorage.getItem('mystair_holland_result');
    if (savedHolland) {
      try {
        const parsed = JSON.parse(savedHolland);
        setHollandResult(parsed);
        if (parsed.topCode) {
          currentProfile.hollandCode = parsed.topCode;
        }
      } catch (e) {
        console.error(e);
      }
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

    // Listen to storage changes in case test results were saved
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 1.5MB to be safe for local storage / firestore
      if (file.size > 1.5 * 1024 * 1024) {
        showToast('이미지 크기가 너무 큽니다 (1.5MB 이하만 가능합니다)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({
          ...prev,
          avatarUrl: base64String
        }));
        showToast('프로필 사진이 임시 적용되었습니다. 상단의 [전체 저장] 버튼을 누르면 최종 반영됩니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullSave = async () => {
    try {
      localStorage.setItem('mystair_mypage_data', JSON.stringify(profile));
      localStorage.setItem('mystair_user_profile', JSON.stringify({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl
      }));
      await updateProfileInFirestore({
        name: profile.name,
        highSchool: profile.highSchool,
        major: profile.major,
        mbti: profile.mbti,
        hollandCode: profile.hollandCode,
        targetCompanies: profile.targetCompanies,
        avatarUrl: profile.avatarUrl
      });
      showToast('마이페이지 프로필이 성공적으로 저장되었습니다!');
      setIsFullEditing(false);
      setEditingField(null);
    } catch (e) {
      showToast('저장 중 오류가 발생했습니다.');
    }
  };

  const savePartialField = async (key: keyof MyProfileData, val: any, fieldLabel: string) => {
    const updated = { ...profile, [key]: val };
    setProfile(updated);
    try {
      localStorage.setItem('mystair_mypage_data', JSON.stringify(updated));
      if (key === 'name' || key === 'email') {
        localStorage.setItem('mystair_user_profile', JSON.stringify({
          name: key === 'name' ? val : profile.name,
          email: key === 'email' ? val : profile.email
        }));
      }
      await updateProfileInFirestore({ [key]: val });
      setEditingField(null);
      showToast(`${fieldLabel} 정보가 변경·저장되었습니다.`);
    } catch (e) {
      showToast('저장 중 오류가 발생했습니다.');
    }
  };

  const handleAddCompany = (companyName?: string) => {
    const target = (companyName || newCompanyInput).trim();
    if (!target) return;
    if (profile.targetCompanies.includes(target)) {
      showToast('이미 희망 기업에 포함되어 있습니다.');
      return;
    }
    const updatedCompanies = [...profile.targetCompanies, target];
    savePartialField('targetCompanies', updatedCompanies, '희망 기업');
    if (!companyName) setNewCompanyInput('');
  };

  const handleRemoveCompany = (companyName: string) => {
    const updatedCompanies = profile.targetCompanies.filter(c => c !== companyName);
    savePartialField('targetCompanies', updatedCompanies, '희망 기업');
  };


  const currentMbtiMeta = mbtiMeta[profile.mbti] || mbtiMeta['ISTJ'];
  const firstHollandChar = profile.hollandCode?.[0] || 'R';
  const secondHollandChar = profile.hollandCode?.[1] || 'C';
  const primaryHollandMeta = hollandMeta[firstHollandChar] || hollandMeta['R'];
  const secondaryHollandMeta = hollandMeta[secondHollandChar] || hollandMeta['C'];

  return (
    <div className="h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent text-white font-sans flex flex-col relative pb-28">
      {/* Soft Ambient Cosmic Glows */}
      <div className="absolute top-[10%] left-[25%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-[30%] right-[20%] w-[420px] h-[420px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-white/10 h-[72px] w-full flex items-center justify-between px-6 sm:px-10 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity">
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px]">
            MY PAGE
          </span>
          <span className="text-[#94A3B8] text-[14px] font-medium border-l border-white/10 pl-4 hidden sm:block">
            나의 성장의 계단 & 진로 프로필
          </span>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-1 w-full max-w-[880px] mx-auto px-4 sm:px-8 py-8 space-y-6 relative z-10">
        
        {/* Editing Banner Alert */}
        {isFullEditing && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-2xl p-4 flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <span>전체 편집 모드입니다. 정보를 수정한 후 [전체 저장] 버튼을 눌러주세요.</span>
            </span>
            <button 
              onClick={handleFullSave}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              저장 완료
            </button>
          </div>
        )}

        {/* ================= INDIVIDUAL PROFILE CARDS (BOXES) ================= */}
        <div className="space-y-5">
          
          {/* Top Profile Hero Header Box */}
          <div className="bg-white/5 backdrop-blur-xs rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            {/* Cosmic Ambient Effects */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[45px] pointer-events-none" />

            <div className="flex items-center gap-5 relative z-10">
              {/* Circular Avatar Container */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.4)] relative overflow-hidden transition-transform duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />
                  
                  <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center relative">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-indigo-300 flex flex-col items-center justify-center">
                        <User size={36} className="shrink-0" />
                      </div>
                    )}

                    {/* Change profile overlay when editing */}
                    {isFullEditing && (
                      <label className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1 cursor-pointer text-[10px] text-white font-extrabold transition-opacity duration-200">
                        <Edit3 size={14} className="text-indigo-300 animate-bounce" />
                        <span>사진 변경</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Sparkling Star Decoration */}
                <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="bg-indigo-500/30 text-indigo-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    마이스터 인재
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2">
                  <span>{profile.highSchool}</span>
                  <span className="text-slate-500">•</span>
                  <span>{profile.major}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => isFullEditing ? handleFullSave() : setIsFullEditing(true)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                  isFullEditing 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {isFullEditing ? <Check size={16} /> : <Edit3 size={16} />}
                <span>{isFullEditing ? '전체 저장' : '전체 편집 모드'}</span>
              </button>
            </div>
          </div>

          {/* 6 Individual Vertical Stacked Cards */}
          <div className="flex flex-col gap-4">

            {/* Box 1: 이름 (Name) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-indigo-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                    <User size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    이름
                  </span>
                </div>

                {editingField !== 'name' && !isFullEditing && (
                  <button
                    onClick={() => { setTempName(profile.name); setEditingField('name'); }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>수정</span>
                  </button>
                )}
              </div>

              {isFullEditing || editingField === 'name' ? (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={isFullEditing ? profile.name : tempName}
                    onChange={e => isFullEditing ? setProfile({ ...profile, name: e.target.value }) : setTempName(e.target.value)}
                    onKeyDown={e => !isFullEditing && e.key === 'Enter' && savePartialField('name', tempName.trim(), '이름')}
                    className="flex-1 bg-slate-950/50 border border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white outline-none transition"
                    placeholder="이름 입력"
                  />
                  {!isFullEditing && (
                    <button
                      onClick={() => savePartialField('name', tempName.trim(), '이름')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                    >
                      <Check size={14} />
                      <span>저장</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-lg font-black text-white">
                  {profile.name}
                </div>
              )}
            </div>

            {/* Box 2: 고등학교 (High School) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-blue-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg">
                    <School size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    고등학교
                  </span>
                </div>

                {editingField !== 'school' && !isFullEditing && (
                  <button
                    onClick={() => { setTempSchool(profile.highSchool); setEditingField('school'); }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>수정</span>
                  </button>
                )}
              </div>

              {isFullEditing || editingField === 'school' ? (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isFullEditing ? profile.highSchool : tempSchool}
                      onChange={e => isFullEditing ? setProfile({ ...profile, highSchool: e.target.value }) : setTempSchool(e.target.value)}
                      onKeyDown={e => !isFullEditing && e.key === 'Enter' && savePartialField('highSchool', tempSchool.trim(), '고등학교')}
                      className="flex-1 bg-slate-950/50 border border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none transition"
                      placeholder="고등학교 선택 또는 입력"
                    />
                    {!isFullEditing && (
                      <button
                        onClick={() => savePartialField('highSchool', tempSchool.trim(), '고등학교')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                      >
                        <Check size={14} />
                        <span>저장</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_SCHOOLS.slice(0, 4).map(sch => (
                      <button
                        key={sch}
                        type="button"
                        onClick={() => {
                          if (isFullEditing) setProfile({ ...profile, highSchool: sch });
                          else setTempSchool(sch);
                        }}
                        className="text-[11px] bg-white/10 hover:bg-white/20 hover:text-white text-slate-300 px-2 py-0.5 rounded-md transition font-medium cursor-pointer"
                      >
                        {sch}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-base font-extrabold text-white">
                  {profile.highSchool}
                </div>
              )}
            </div>

            {/* Box 3: 전공 (Major) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-purple-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                    <GraduationCap size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    전공 학과
                  </span>
                </div>

                {editingField !== 'major' && !isFullEditing && (
                  <button
                    onClick={() => { setTempMajor(profile.major); setEditingField('major'); }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>수정</span>
                  </button>
                )}
              </div>

              {isFullEditing || editingField === 'major' ? (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isFullEditing ? profile.major : tempMajor}
                      onChange={e => isFullEditing ? setProfile({ ...profile, major: e.target.value }) : setTempMajor(e.target.value)}
                      onKeyDown={e => !isFullEditing && e.key === 'Enter' && savePartialField('major', tempMajor.trim(), '전공')}
                      className="flex-1 bg-slate-950/50 border border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none transition"
                      placeholder="전공 학과 선택 또는 입력"
                    />
                    {!isFullEditing && (
                      <button
                        onClick={() => savePartialField('major', tempMajor.trim(), '전공')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                      >
                        <Check size={14} />
                        <span>저장</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_MAJORS.slice(0, 4).map(maj => (
                      <button
                        key={maj}
                        type="button"
                        onClick={() => {
                          if (isFullEditing) setProfile({ ...profile, major: maj });
                          else setTempMajor(maj);
                        }}
                        className="text-[11px] bg-white/10 hover:bg-white/20 hover:text-white text-slate-300 px-2 py-0.5 rounded-md transition font-medium cursor-pointer"
                      >
                        {maj}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-base font-extrabold text-white">
                  {profile.major}
                </div>
              )}
            </div>

            {/* Box 4: MBTI 성격 진단 (결과만 뜨고 상세분석 버튼 제공) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-pink-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-pink-500/20 text-pink-300 rounded-lg">
                    <Brain size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    MBTI 성격 진단
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {editingField !== 'mbti' && !isFullEditing && (
                    <button
                      onClick={() => { setTempMbti(profile.mbti); setEditingField('mbti'); }}
                      className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>수정</span>
                    </button>
                  )}
                </div>
              </div>

              {isFullEditing || editingField === 'mbti' ? (
                <div className="bg-pink-950/40 rounded-xl p-3 border border-pink-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <select
                      value={isFullEditing ? profile.mbti : tempMbti}
                      onChange={e => isFullEditing ? setProfile({ ...profile, mbti: e.target.value }) : setTempMbti(e.target.value)}
                      className="flex-1 bg-slate-900 border border-pink-500/30 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none"
                    >
                      {Object.keys(mbtiMeta).map(type => (
                        <option key={type} value={type}>
                          {type} - {mbtiMeta[type].alias}
                        </option>
                      ))}
                    </select>
                    {!isFullEditing && (
                      <button
                        onClick={() => savePartialField('mbti', tempMbti, 'MBTI')}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        저장
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-xl font-black text-pink-400 tracking-tight">{profile.mbti}</span>
                    <span className="text-xs font-extrabold text-slate-300 block mt-0.5">
                      {currentMbtiMeta.alias}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModal('mbti')}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer animate-pulse"
                  >
                    <span>상세분석</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Box 5: 홀랜드 직업 적성 (결과만 뜨고 상세분석 버튼 제공) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-cyan-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                    <Compass size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    홀랜드 진로 적성
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {editingField !== 'holland' && !isFullEditing && (
                    <button
                      onClick={() => { setTempHolland(profile.hollandCode); setEditingField('holland'); }}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>수정</span>
                    </button>
                  )}
                </div>
              </div>

              {isFullEditing || editingField === 'holland' ? (
                <div className="bg-cyan-950/40 rounded-xl p-3 border border-cyan-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isFullEditing ? profile.hollandCode : tempHolland}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        if (isFullEditing) setProfile({ ...profile, hollandCode: val });
                        else setTempHolland(val);
                      }}
                      className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white uppercase outline-none"
                      placeholder="예: RC"
                    />
                    {!isFullEditing && (
                      <button
                        onClick={() => savePartialField('hollandCode', tempHolland.trim(), '홀랜드 코드')}
                        className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        저장
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-xl font-black text-cyan-400 tracking-tight">{profile.hollandCode}형</span>
                    <span className="text-xs font-extrabold text-slate-300 block mt-0.5">
                      {primaryHollandMeta.name} & {secondaryHollandMeta.name}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModal('holland')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>상세분석</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Box 6: 희망 기업 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white hover:border-emerald-400 hover:bg-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-3 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                    <Building2 size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    희망 기업 ({profile.targetCompanies.length}개)
                  </span>
                </div>

                <button
                  onClick={() => setActiveModal('companies')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-extrabold"
                >
                  <span>기업 추가/관리</span> <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCompanyInput}
                    onChange={e => setNewCompanyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCompany())}
                    placeholder="목표 기업명 입력 (예: 삼성전자, 한국전력공사)"
                    className="flex-1 bg-slate-950/50 border border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none transition"
                  />
                  <button
                    onClick={() => handleAddCompany()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>추가</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.targetCompanies.length === 0 ? (
                    <span className="text-xs text-slate-300 italic">설정된 희망 기업이 없습니다.</span>
                  ) : (
                    profile.targetCompanies.map(comp => (
                      <div 
                        key={comp}
                        className="bg-white/10 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border border-white/20"
                      >
                        <Building2 size={13} className="text-emerald-400" />
                        <span>{comp}</span>
                        <button
                          onClick={() => handleRemoveCompany(comp)}
                          title="삭제"
                          className="text-slate-300 hover:text-red-400 transition cursor-pointer ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <span className="text-xs text-slate-400 font-medium">
              💡 각 박스의 [수정]으로 즉시 변경하거나 [전체 편집 모드]로 상단에서 일괄 수정할 수 있습니다.
            </span>

            <div className="flex items-center gap-2">
              {isFullEditing && (
                <button
                  onClick={handleFullSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>전체 저장 완료</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ================= MODAL 1: MBTI Detail Modal ================= */}
      {activeModal === 'mbti' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900/95 text-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative space-y-6 my-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="p-2.5 bg-pink-500/20 text-pink-400 rounded-2xl">
                <Brain size={24} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-white">MBTI 성격 진단 상세 내역</h3>
                <p className="text-xs text-slate-400 font-medium">나의 성격 유형 분석 및 맞춤 직무 가이드</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Type Summary */}
              <div className="bg-gradient-to-r from-pink-950/20 to-indigo-950/20 p-5 rounded-2xl border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-pink-400">{profile.mbti}</span>
                    <span className="text-sm font-extrabold text-slate-300">({currentMbtiMeta.alias})</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                    {currentMbtiMeta.desc}
                  </p>
                </div>

                <div className="shrink-0 space-y-1 bg-slate-950 p-2.5 rounded-xl border border-pink-500/20 shadow-xs">
                  <label className="text-[10px] font-extrabold text-slate-400 block">수동 유형 변경</label>
                  <select
                    value={profile.mbti}
                    onChange={e => savePartialField('mbti', e.target.value, 'MBTI')}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold outline-none"
                  >
                    {Object.keys(mbtiMeta).map(type => (
                      <option key={type} value={type} className="bg-slate-900 text-white">
                        {type} - {mbtiMeta[type].alias}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MBTI Ratios if test taken */}
              {mbtiResult && mbtiResult.ratios && (
                <div className="bg-indigo-950/30 rounded-2xl p-4 border border-indigo-500/20 space-y-3">
                  <div className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    <span>실제 검사 세부지표 비율</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(mbtiResult.ratios).map(k => {
                      const item = mbtiResult.ratios[k];
                      return (
                        <div key={k} className="bg-slate-950/80 p-3 rounded-xl border border-white/5 shadow-2xs">
                          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                            <span>{item.label}</span>
                            <span className="text-indigo-400">{item.val}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full" 
                              style={{ width: `${item.val}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Jobs */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-300 block">
                  🎯 MBTI 유형별 추천 직무 전체 목록
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentMbtiMeta.jobs.map((job: string) => (
                    <span 
                      key={job} 
                      className="bg-slate-950/80 border border-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <Link
                to="/mbti"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>MBTI 진단 검사 다시하기</span>
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-slate-850 hover:bg-slate-800 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: Holland Detail Modal ================= */}
      {activeModal === 'holland' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900/95 text-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative space-y-6 my-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl">
                <Compass size={24} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-white">홀랜드 직업 적성 검사 상세</h3>
                <p className="text-xs text-slate-400 font-medium">RIASEC 직업적성 유형 분석 및 진로 소견</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Code Summary */}
              <div className="bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 p-5 rounded-2xl border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-cyan-400">{profile.hollandCode}형</span>
                    <span className="text-xs font-extrabold text-slate-300">
                      ({primaryHollandMeta.name} & {secondaryHollandMeta.name})
                    </span>
                  </div>

                  <input
                    type="text"
                    value={profile.hollandCode}
                    onChange={e => savePartialField('hollandCode', e.target.value.toUpperCase(), '홀랜드 코드')}
                    className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-white outline-none w-24 text-center"
                    placeholder="예: RC"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 space-y-1">
                    <span className="font-extrabold text-cyan-400 block">1순위: {primaryHollandMeta.name}</span>
                    <p className="text-slate-300 font-medium leading-relaxed">{primaryHollandMeta.desc}</p>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 space-y-1">
                    <span className="font-extrabold text-indigo-400 block">2순위: {secondaryHollandMeta.name}</span>
                    <p className="text-slate-300 font-medium leading-relaxed">{secondaryHollandMeta.desc}</p>
                  </div>
                </div>
              </div>

              {/* Holland Percentages if test taken */}
              {hollandResult && hollandResult.percentages && (
                <div className="bg-cyan-950/30 rounded-2xl p-4 border border-cyan-500/20 space-y-3">
                  <div className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Award size={14} className="text-cyan-400 animate-pulse" />
                    <span>실제 홀랜드 RIASEC 적합도 지표</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.keys(hollandResult.percentages).map(typeKey => {
                      const val = hollandResult.percentages[typeKey];
                      const meta = hollandMeta[typeKey];
                      return (
                        <div key={typeKey} className="bg-slate-950/80 p-2.5 rounded-xl border border-white/5 text-xs">
                          <div className="flex justify-between font-bold text-slate-300 mb-1">
                            <span>{meta?.name?.split(' ')[0] || typeKey}</span>
                            <span className="text-cyan-400">{val}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full" 
                              style={{ width: `${val}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Editable Holland Note */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">
                  📝 진로 지도 및 적성 종합 소견
                </label>
                <textarea
                  value={profile.hollandNote}
                  onChange={e => setProfile({ ...profile, hollandNote: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl p-3 text-xs font-medium text-white outline-none transition"
                  placeholder="진로 지도 메모 및 소견을 입력하세요."
                />
              </div>

              {/* Recommended Jobs */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-300 block">
                  🎯 맞춤 추천 직무
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set([...primaryHollandMeta.jobs, ...secondaryHollandMeta.jobs])).map((job: string) => (
                    <span 
                      key={job} 
                      className="bg-slate-950/80 border border-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <Link
                to="/holland"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>홀랜드 검사 다시하기</span>
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem('mystair_mypage_data', JSON.stringify(profile));
                  setActiveModal(null);
                  showToast('소견 저장 완료');
                }}
                className="bg-slate-850 hover:bg-slate-800 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                저장 후 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: Target Companies Detail Modal ================= */}
      {activeModal === 'companies' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900/95 text-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative space-y-6 my-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <Building2 size={24} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-white">희망 기업 (Target Companies) 설정</h3>
                <p className="text-xs text-slate-400 font-medium">마이스터고 및 직업계고 학생들이 목표로 하는 주요 기업 관리</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Selected List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">
                    현재 선택된 희망 기업 ({profile.targetCompanies.length}개)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[52px] p-3.5 bg-slate-950/80 rounded-2xl border border-white/10 items-center">
                  {profile.targetCompanies.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">등록된 기업이 없습니다. 아래의 추천 기업을 클릭하여 추가해 보세요.</span>
                  ) : (
                    profile.targetCompanies.map(comp => (
                      <div 
                        key={comp}
                        className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs border border-white/10"
                      >
                        <Building2 size={13} className="text-emerald-400" />
                        <span>{comp}</span>
                        <button
                          onClick={() => handleRemoveCompany(comp)}
                          title="삭제"
                          className="text-slate-400 hover:text-red-400 transition cursor-pointer ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Search / Add Input */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">
                  직접 기업 추가하기
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCompanyInput}
                    onChange={e => setNewCompanyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCompany())}
                    placeholder="기업명을 입력하세요 (예: LG에너지솔루션)"
                    className="flex-1 bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCompany()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus size={15} />
                    <span>추가</span>
                  </button>
                </div>
              </div>

              {/* Popular Presets */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-extrabold text-slate-400 block">
                  💡 인기 마이스터고 추천 목표 기업 (클릭시 바로 추가/삭제)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COMPANIES.map(comp => {
                    const isAdded = profile.targetCompanies.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => isAdded ? handleRemoveCompany(comp) : handleAddCompany(comp)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                          isAdded 
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-950/50 text-slate-300 hover:bg-slate-950/80 border border-white/10'
                        }`}
                      >
                        {isAdded ? <Check size={12} /> : <Plus size={12} />}
                        <span>{comp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                onClick={() => {
                  localStorage.setItem('mystair_mypage_data', JSON.stringify(profile));
                  setActiveModal(null);
                  showToast('희망 기업 설정이 저장되었습니다.');
                }}
                className="bg-slate-850 hover:bg-slate-800 border border-white/10 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                설정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Popup */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-extrabold shadow-2xl z-[200] border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
