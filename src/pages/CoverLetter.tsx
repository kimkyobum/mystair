import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  Trash2, 
  Sparkles, 
  Check, 
  Clock,
  Building,
  Target,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  X,
  ExternalLink,
  PlusCircle,
  Wand2,
  RefreshCw,
  Camera,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth, DiaryEntry } from '../context/AuthContext';
import { checkAndCorrectKoreanSpelling, correctKoreanText } from '../utils/koreanSpellChecker';

export interface CoverLetterSection {
  id: string;
  title: string;
  recommendedChars: number;
  placeholder: string;
}

// 5개 개별 항목
const DEFAULT_SECTIONS: CoverLetterSection[] = [
  {
    id: 'growth',
    title: '1. 성장과정',
    recommendedChars: 500,
    placeholder: '학창 시절 및 지금까지의 생활에서 가치관을 형성하게 된 중요한 계기나 경험을 서술하세요.'
  },
  {
    id: 'intro',
    title: '2. 자기소개',
    recommendedChars: 400,
    placeholder: '자신을 가장 잘 드러내는 한 줄의 키워드와 함께, 어떤 인재인지 간결하고 명확하게 소개하세요.'
  },
  {
    id: 'strengths',
    title: '3. 장점',
    recommendedChars: 400,
    placeholder: '자신의 가장 큰 강점과, 그 강점이 실무나 협업 현장에서 긍정적으로 발휘된 경험을 서술하세요.'
  },
  {
    id: 'weaknesses',
    title: '4. 단점',
    recommendedChars: 400,
    placeholder: '자신이 가진 부족한 점을 솔직하게 인정하고, 이를 보완하기 위해 실천 중인 구체적인 노력과 루틴을 서술하세요.'
  },
  {
    id: 'practice',
    title: '5. 실습경험',
    recommendedChars: 600,
    placeholder: '전공 실습, 프로젝트, 자격증 취득, 경진대회 중 부딪힌 문제와 이를 해결한 과정(행동 및 배운 점)을 서술하세요.'
  }
];

export default function CoverLetter() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const { user, userProfile, fetchDiaries } = useAuth();

  const userKey = user?.uid ? `mystair_cover_letter_v2_${user.uid}` : 'mystair_cover_letter_v2_guest';

  // Section answers state
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) return JSON.parse(saved);
      const oldKey = user?.uid ? `mystair_cover_letter_${user.uid}` : 'mystair_cover_letter_guest';
      const oldSaved = localStorage.getItem(oldKey);
      if (oldSaved) {
        const oldData = JSON.parse(oldSaved);
        return {
          growth: oldData.intro || '',
          intro: '',
          strengths: oldData.strengths || '',
          weaknesses: '',
          practice: oldData.competency || ''
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      growth: '',
      intro: '',
      strengths: '',
      weaknesses: '',
      practice: ''
    };
  });

  const [targetCompany, setTargetCompany] = useState<string>(() => {
    try {
      return localStorage.getItem(`${userKey}_target_company`) || userProfile?.targetCompanies?.[0] || '';
    } catch {
      return '';
    }
  });

  const [targetRole, setTargetRole] = useState<string>(() => {
    try {
      return localStorage.getItem(`${userKey}_target_role`) || userProfile?.major || '';
    } catch {
      return '';
    }
  });

  const [savedTime, setSavedTime] = useState<string>('');
  
  // Experience drawer open per section
  const [openExperiences, setOpenExperiences] = useState<Record<string, boolean>>({
    growth: false,
    intro: false,
    strengths: false,
    weaknesses: false,
    practice: false
  });

  // Auto-fixing state per section & undo history
  const [fixingSectionId, setFixingSectionId] = useState<string | null>(null);
  const [fixNotification, setFixNotification] = useState<Record<string, string>>({});
  const [undoHistory, setUndoHistory] = useState<Record<string, string>>({});

  // Diary entries from Growth Diary
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [activeDiarySectionId, setActiveDiarySectionId] = useState<string | null>(null);

  // Load diaries
  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const fetched = await fetchDiaries();
        if (fetched && fetched.length > 0) {
          setDiaries(fetched);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch from firestore', err);
      }
      
      const uid = user?.uid || 'local-user';
      const saved = localStorage.getItem(`mystair_local_diaries_${uid}`);
      if (saved) {
        try {
          setDiaries(JSON.parse(saved));
        } catch {
          // ignore
        }
      } else {
        setDiaries([
          {
            id: 'sample-1',
            userId: 'local',
            title: 'PLC 시퀀스 제어 실습 회로 결선 및 모터 구동 성공',
            content: '오늘 자동화 설비 실습에서 PLC 입출력 결선 작업을 직접 수행했다. 처음에는 인터록 회로 타이밍 문제로 모터가 간헐적으로 오작동했으나, 배선 도면을 재검토하고 래더 다이어그램 로직을 0.5초 딜레이를 주어 수정한 결과 정상 구동에 성공했다.',
            date: '2026-03-18',
            mood: '🔥',
            tags: ['실습', 'PLC', '트러블슈팅']
          },
          {
            id: 'sample-2',
            userId: 'local',
            title: '전기기능사 3상 유도전동기 회로 배선 작업 완벽 통과',
            content: '단자대 번호 매기기부터 주회로 흑적청녹 배선까지 표준 규격에 맞춰 꼼꼼하게 작업했다. 벨테스터기로 단선 검사를 3회 반복한 끝에 시험관 선생님으로부터 결선 상태가 매우 깔끔하다는 칭찬을 받았다.',
            date: '2026-03-12',
            mood: '😊',
            tags: ['자격증', '전기기능사', '칭찬']
          }
        ]);
      }
    };
    loadDiaries();
  }, [user]);

  // Save to localStorage
  const handleSave = (silent: boolean = false) => {
    try {
      localStorage.setItem(userKey, JSON.stringify(answers));
      localStorage.setItem(`${userKey}_target_company`, targetCompany);
      localStorage.setItem(`${userKey}_target_role`, targetRole);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setSavedTime(timeStr);
      if (!silent) {
        alert(t('자기소개서가 브라우저에 안전하게 저장되었습니다!'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [answers, targetCompany, targetRole]);

  // Section answer change
  const handleChange = (id: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: text
    }));
  };

  // Clear single section
  const handleClearSection = (id: string) => {
    if (window.confirm(t('이 항목의 작성 내용을 모두 지우시겠습니까?'))) {
      handleChange(id, '');
      setFixNotification(prev => ({ ...prev, [id]: '' }));
    }
  };

  // [오타 수정] 버튼: AI 및 국립국어원 표준 엔진으로 모든 오타와 띄어쓰기를 정확하게 자동 교정
  const handleAutoFixSpelling = async (sectionId: string) => {
    const originalText = answers[sectionId] || '';
    if (!originalText.trim()) {
      alert(t('오타 수정을 진행할 텍스트를 먼저 입력해주세요!'));
      return;
    }

    setFixingSectionId(sectionId);
    setFixNotification(prev => ({ ...prev, [sectionId]: '' }));

    try {
      const result = await checkAndCorrectKoreanSpelling(originalText);
      const isActuallyModified = result.changed && result.correctedText.trim() !== originalText.trim();

      if (isActuallyModified) {
        // 이전 원문 기록 보관 (되돌리기 가능)
        setUndoHistory(prev => ({ ...prev, [sectionId]: originalText }));
        // 교정된 텍스트 본문에 즉각 반영
        handleChange(sectionId, result.correctedText);

        const countText = result.count > 0 ? ` (${result.count}건 교정)` : '';
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t(`✨ 오타와 띄어쓰기가 깔끔하게 교정되었습니다!${countText}`)
        }));
      } else {
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t('💡 교정할 오타나 맞춤법 오류가 발견되지 않았습니다. 올바른 문장입니다.')
        }));
      }
    } catch (err) {
      console.warn('Spell correction error, applying local engine fallback:', err);
      const localResult = correctKoreanText(originalText);
      if (localResult.correctedText.trim() !== originalText.trim()) {
        setUndoHistory(prev => ({ ...prev, [sectionId]: originalText }));
        handleChange(sectionId, localResult.correctedText);
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t('✨ 오타와 띄어쓰기가 깔끔하게 교정되었습니다!')
        }));
      } else {
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t('💡 교정할 오타나 맞춤법 오류가 발견되지 않았습니다. 올바른 문장입니다.')
        }));
      }
    } finally {
      setTimeout(() => {
        setFixNotification(prev => ({ ...prev, [sectionId]: '' }));
      }, 5000);
      setFixingSectionId(null);
    }
  };

  // [되돌리기]: 오타 수정 이전 내용으로 복원
  const handleUndo = (sectionId: string) => {
    const prev = undoHistory[sectionId];
    if (prev !== undefined) {
      handleChange(sectionId, prev);
      setUndoHistory(hist => {
        const copy = { ...hist };
        delete copy[sectionId];
        return copy;
      });
      setFixNotification(prevNotif => ({
        ...prevNotif,
        [sectionId]: t('↩️ 이전 작성 내용으로 되돌렸습니다.')
      }));
      setTimeout(() => {
        setFixNotification(prevNotif => ({ ...prevNotif, [sectionId]: '' }));
      }, 3000);
    }
  };

  // Insert diary snippet (날짜와 제목은 제외하고 본문 내용만 인용)
  const handleInsertDiary = (sectionId: string, diary: DiaryEntry) => {
    const prev = (answers[sectionId] || '').trim();
    const content = (diary.content || '').trim();
    if (!content) return;

    const newText = prev ? `${prev}\n\n${content}` : content;
    handleChange(sectionId, newText);
    setSelectedDiary(null);

    setFixNotification(prevNotif => ({
      ...prevNotif,
      [sectionId]: t(`✨ '${diary.title}' 경험 내용이 인용되었습니다.`)
    }));
    setTimeout(() => {
      setFixNotification(prevNotif => ({ ...prevNotif, [sectionId]: '' }));
    }, 3500);
  };

  // Total characters count
  const totalChars = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
  const totalCharsNoSpace = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.replace(/\s/g, '').length : 0), 0);

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/80 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-emerald-600' : 'text-white hover:text-emerald-400'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-1 sm:ml-2 shrink-0">
            {t('자기소개서 작성')}
          </span>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/interview"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Camera size={14} />
            <span>{t('AI 모의면접')}</span>
          </Link>

          {savedTime && (
            <span className={`text-[11px] hidden sm:flex items-center gap-1 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock size={12} />
              <span>{savedTime} {t('자동저장됨')}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>{t('저장하기')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* Clean Header Info Card: Title + Target Company/Major + Total Char Count */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900/90 border-slate-800"
        }`}>
          {/* Top Title & Total Chars */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <h1 className={`text-xl font-black flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                <FileText className="text-emerald-500" size={22} />
                <span>{t('자기소개서 작성')}</span>
              </h1>
            </div>

            {/* Total characters badge */}
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shrink-0 text-xs font-bold ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}>
              <span className="text-[11px] text-slate-400 font-normal">{t('총 글자수')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{totalChars}자</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-[11px] text-slate-400 font-normal">{t('공백제외')}:</span>
              <span>{totalCharsNoSpace}자</span>
            </div>
          </div>

          {/* Target Company & Major Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Building size={15} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-500 shrink-0">{t('희망지원기업')}:</span>
              <input 
                type="text" 
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder={t('예: 삼성전자, 한국전력공사 등')}
                className={`flex-1 border rounded-lg px-3 py-2 font-semibold outline-none transition-colors ${
                  isLightMode 
                    ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                    : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <Target size={15} className="text-teal-500 shrink-0" />
              <span className="font-bold text-slate-500 shrink-0">{t('전공 / 직무')}:</span>
              <input 
                type="text" 
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder={t('예: 전자제어과, 설비보전 등')}
                className={`flex-1 border rounded-lg px-3 py-2 font-semibold outline-none transition-colors ${
                  isLightMode 
                    ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                    : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 5 Distinct Sections */}
        <div className="space-y-6">
          {DEFAULT_SECTIONS.map((sec) => {
            const currentVal = answers[sec.id] || '';
            const charCount = currentVal.length;
            const charCountNoSpace = currentVal.replace(/\s/g, '').length;
            const isExperienceOpen = !!openExperiences[sec.id];
            const isFixing = fixingSectionId === sec.id;
            const notif = fixNotification[sec.id];

            return (
              <div 
                key={sec.id}
                className={`rounded-2xl border transition-all ${
                  isLightMode 
                    ? "bg-white border-slate-200 shadow-xs hover:border-slate-300" 
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs"
                }`}
              >
                {/* Header: Clean Title + Right Controls ([내 경험], [비우기]) */}
                <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between gap-3 ${
                  isLightMode ? "border-slate-100 bg-slate-50/50 rounded-t-2xl" : "border-slate-800/80 bg-slate-800/30 rounded-t-2xl"
                }`}>
                  {/* Title Only */}
                  <div className="flex items-center gap-2">
                    <h2 className={`text-base font-extrabold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                      {t(sec.title)}
                    </h2>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isLightMode ? "bg-white border-slate-200 text-slate-500" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      {sec.recommendedChars}{t('자 권장')}
                    </span>
                  </div>

                  {/* Buttons: [내 경험], [비우기] */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* [내 경험] 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() => setOpenExperiences(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                        isExperienceOpen
                          ? isLightMode 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                            : "bg-emerald-500 text-slate-950 font-black border-emerald-500 shadow-xs"
                          : isLightMode 
                            ? "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40" 
                            : "bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700/60"
                      }`}
                      title={t('내가 작성한 성장 다이어리 실습 경험 보기')}
                    >
                      <BookOpen size={13} className={isExperienceOpen ? (isLightMode ? "text-white" : "text-slate-950") : "text-emerald-500"} />
                      <span>{t('내 경험')}</span>
                      {diaries.length > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isExperienceOpen 
                            ? isLightMode ? "bg-white/25 text-white" : "bg-slate-900/30 text-slate-950" 
                            : isLightMode ? "bg-emerald-100 text-emerald-800" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}>
                          {diaries.length}
                        </span>
                      )}
                      {isExperienceOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {/* Clear */}
                    {currentVal && (
                      <button
                        type="button"
                        onClick={() => handleClearSection(sec.id)}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border text-rose-500 transition-colors cursor-pointer ${
                          isLightMode ? "bg-white border-slate-200 hover:bg-rose-50 hover:border-rose-200" : "bg-slate-800 border-slate-700 hover:bg-rose-950/50"
                        }`}
                        title={t('내용 비우기')}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* [내 경험] 누르면 밑에 뜨는 사용자 경험(성장 다이어리) 펼침 영역 */}
                {isExperienceOpen && (
                  <div className={`px-4 sm:px-5 py-4 border-b text-xs transition-all animate-in fade-in-50 duration-200 ${
                    isLightMode ? "bg-emerald-50/30 border-emerald-100" : "bg-emerald-950/20 border-emerald-900/40"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <BookOpen size={14} className="text-emerald-500" />
                        <span className="text-xs sm:text-sm font-extrabold">{t('내가 작성한 성장 다이어리 경험 기록')}</span>
                        <span className="hidden sm:inline text-[11px] font-normal text-slate-400">
                          ({t('클릭하여 상세 확인 및 본문 인용 가능')})
                        </span>
                      </div>
                      <Link 
                        to="/diary" 
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                      >
                        <span>{t('다이어리 더 쓰러가기')}</span>
                        <ExternalLink size={10} />
                      </Link>
                    </div>

                    {diaries.length === 0 ? (
                      <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                        isLightMode ? "bg-white border-slate-200 text-slate-500" : "bg-slate-800/80 border-slate-700 text-slate-400"
                      }`}>
                        <p className="text-xs font-semibold">{t('아직 등록된 성장 다이어리가 없습니다.')}</p>
                        <p className="text-[11px] text-slate-400">{t('성장다이어리에 전공 실습, 대회 참가, 자격증 취득 경험을 기록하면 이곳에서 바로 불러올 수 있습니다.')}</p>
                        <Link
                          to="/diary"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white mt-1 shadow-2xs"
                        >
                          <PlusCircle size={13} />
                          <span>{t('다이어리에 첫 경험 기록하기')}</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {diaries.map((diary) => (
                          <div
                            key={diary.id || diary.date + diary.title}
                            className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs transition-all shadow-2xs group ${
                              isLightMode 
                                ? "bg-white border-slate-200/90 hover:border-emerald-400 text-slate-800" 
                                : "bg-slate-800 border-slate-700 hover:border-emerald-500 text-slate-200"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDiary(diary);
                                setActiveDiarySectionId(sec.id);
                              }}
                              className="font-bold text-xs truncate max-w-[200px] sm:max-w-[260px] cursor-pointer text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title={`${diary.title} (${t('클릭하여 내용 확인')})`}
                            >
                              {diary.title}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertDiary(sec.id, diary)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                              title={t('본문에 내용 인용')}
                            >
                              <span>{t('인용')}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-fix Notification Message if any with Undo Option */}
                {notif && (
                  <div className={`px-4 sm:px-5 py-2.5 border-b text-xs flex items-center justify-between transition-all animate-in fade-in duration-200 ${
                    notif.includes('💡')
                      ? isLightMode ? "bg-amber-50/90 border-amber-200 text-amber-900" : "bg-amber-950/40 border-amber-800 text-amber-300"
                      : isLightMode ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {notif.includes('✨') ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Sparkles size={14} className="text-amber-500" />
                      )}
                      <span>{notif}</span>
                    </div>

                    {undoHistory[sec.id] !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleUndo(sec.id)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ml-2 shrink-0 ${
                          isLightMode 
                            ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" 
                            : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                        }`}
                        title={t('수정 전 내용으로 되돌리기')}
                      >
                        <RotateCcw size={11} />
                        <span>{t('되돌리기')}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Clean Textarea Input Box with Quick Action Header */}
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-400">
                      {t('내용 작성')}
                    </span>

                    {/* Prominent in-box [오타 수정] button */}
                    <button
                      type="button"
                      disabled={isFixing || !currentVal.trim()}
                      onClick={() => handleAutoFixSpelling(sec.id)}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                        isFixing
                          ? "bg-amber-100 text-amber-800 border-amber-300 cursor-wait"
                          : !currentVal.trim()
                            ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                            : isLightMode
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 active:scale-95"
                              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-emerald-500 active:scale-95"
                      }`}
                      title={t('클릭 시 이 박스 안의 모든 오타와 띄어쓰기를 즉시 자동 교정합니다')}
                    >
                      {isFixing ? (
                        <>
                          <RefreshCw size={13} className="animate-spin text-amber-600" />
                          <span>{t('수정 중...')}</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          <span>{t('오타 수정')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={currentVal}
                    onChange={e => handleChange(sec.id, e.target.value)}
                    placeholder={t(sec.placeholder)}
                    className={`w-full border-2 rounded-xl p-4 text-sm font-medium outline-none leading-relaxed transition-all resize-y ${
                      isLightMode 
                        ? "bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:shadow-xs" 
                        : "bg-slate-800/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-800"
                    }`}
                  />

                  {/* Character Counter right in each box */}
                  <div className="flex items-center justify-between pt-1 px-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm transition-colors ${
                        charCount > 0 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : isLightMode ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {charCount}자
                      </span>
                      <span className={isLightMode ? "text-slate-300" : "text-slate-600"}>/</span>
                      <span className={`text-[11px] ${isLightMode ? "text-slate-400" : "text-slate-500"}`}>
                        {t('공백제외')} {charCountNoSpace}자
                      </span>
                      <span className={isLightMode ? "text-slate-300" : "text-slate-600"}>•</span>
                      <span className={`text-[11px] ${charCount >= sec.recommendedChars * 0.7 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}>
                        {Math.round((charCount / sec.recommendedChars) * 100)}% {t('달성')}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {charCount > sec.recommendedChars + 100 ? (
                        <span className="text-rose-500 font-bold">{t('⚠️ 권장 분량 초과')}</span>
                      ) : (
                        t('자동 저장 중')
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className={`mt-8 p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="text-xs text-slate-500">
            <span className="font-bold text-slate-700 dark:text-slate-300">{t('총 작성 글자수')}: </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">{totalChars}자</span>
            <span className="mx-1.5 text-slate-300">|</span>
            <span>{t('작성 중인 내용은 브라우저에 안전하게 실시간 보관됩니다.')}</span>
          </div>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>{t('저장하기')}</span>
          </button>
        </div>

      </div>

      {/* DIARY DETAIL & INSERT MODAL */}
      {selectedDiary && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"
        }`}>
          <div className={`border-2 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-emerald-500/50 text-white"
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 mb-4 flex-none ${
              isLightMode ? "border-slate-200" : "border-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedDiary.mood || '📝'}</span>
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    {selectedDiary.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>{selectedDiary.date}</span>
                    {selectedDiary.tags && selectedDiary.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {selectedDiary.tags.map((tg, idx) => (
                            <span key={idx} className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedDiary(null)} 
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLightMode ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Diary Content */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              <div className={`p-4 rounded-2xl border ${
                isLightMode ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-800/60 border-slate-700 text-slate-200"
              }`}>
                {selectedDiary.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`mt-4 pt-3.5 border-t flex items-center justify-end gap-2 flex-none ${
              isLightMode ? "border-slate-200" : "border-slate-800"
            }`}>
              <button
                type="button"
                onClick={() => setSelectedDiary(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                }`}
              >
                {t('닫기')}
              </button>

              {activeDiarySectionId && (
                <button
                  type="button"
                  onClick={() => handleInsertDiary(activeDiarySectionId, selectedDiary)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={14} />
                  <span>{t('이 문항에 내용 넣기')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
