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
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth, DiaryEntry } from '../context/AuthContext';
import { correctKoreanText } from '../utils/koreanSpellChecker';

export interface CoverLetterSection {
  id: string;
  title: string;
  recommendedChars: number;
  placeholder: string;
  tips: string[];
  enableDiaryHelper?: boolean;
}

// 5개 개별 항목
const DEFAULT_SECTIONS: CoverLetterSection[] = [
  {
    id: 'growth',
    title: '1. 성장과정',
    recommendedChars: 500,
    placeholder: '학창 시절 및 지금까지의 생활에서 가치관을 형성하게 된 중요한 계기나 경험을 서술하세요.',
    tips: [
      '어릴 적부터의 단순 나열보다는, 자신에게 큰 영향을 준 구체적인 사건이나 인물을 중심으로 작성하세요.',
      '그 경험을 통해 어떤 가치관(성실, 책임감, 도전의식 등)을 갖게 되었는지 명확히 연결하세요.'
    ],
    enableDiaryHelper: true
  },
  {
    id: 'intro',
    title: '2. 자기소개',
    recommendedChars: 400,
    placeholder: '자신을 가장 잘 드러내는 한 줄의 키워드와 함께, 어떤 인재인지 간결하고 명확하게 소개하세요.',
    tips: [
      '자신을 상징하는 비유나 핵심 역량 키워드로 첫 문장을 시작하면 주목도가 높아집니다.',
      '마이스터/특성화고인으로서 현장에 즉시 적응할 수 있는 자신의 준비된 자세를 강조하세요.'
    ]
  },
  {
    id: 'strengths',
    title: '3. 장점',
    recommendedChars: 400,
    placeholder: '자신의 가장 큰 강점과, 그 강점이 실무나 협업 현장에서 긍정적으로 발휘된 경험을 서술하세요.',
    tips: [
      '단순히 "꼼꼼하다"고 하기보다는, 실습이나 프로젝트에서 꼼꼼함 덕분에 문제를 예방했던 사례를 제시하세요.',
      '희망하는 직무나 현장에서 직접적으로 요구되는 핵심 역량과 연결할수록 좋습니다.'
    ]
  },
  {
    id: 'weaknesses',
    title: '4. 단점',
    recommendedChars: 400,
    placeholder: '자신이 가진 부족한 점을 솔직하게 인정하고, 이를 보완하기 위해 실천 중인 구체적인 노력과 루틴을 서술하세요.',
    tips: [
      '치명적인 결함(무책임, 지각 등) 대신 개선 가능한 습관을 솔직하게 언급하세요.',
      '단점을 개선하기 위해 체크리스트를 쓰거나 메모하는 등 구체적인 극복 행동을 반드시 함께 적으세요.'
    ]
  },
  {
    id: 'practice',
    title: '5. 실습경험',
    recommendedChars: 600,
    placeholder: '전공 실습, 프로젝트, 자격증 취득, 경진대회 중 부딪힌 문제와 이를 해결한 과정(행동 및 배운 점)을 서술하세요.',
    tips: [
      'STAR 공법(Situation 상황 - Task 과제 - Action 나의 행동 - Result 성과)으로 적으면 논리적입니다.',
      '성장다이어리의 [자소서 요약] 버튼에서 추천받은 나의 STAR 실습 기록을 참고하여 구체적인 수치와 함께 작성하세요.'
    ],
    enableDiaryHelper: true
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
  
  // Tips visibility per section
  const [showTips, setShowTips] = useState<Record<string, boolean>>({
    growth: false,
    intro: false,
    strengths: false,
    weaknesses: false,
    practice: false
  });

  // Auto-fixing state per section
  const [fixingSectionId, setFixingSectionId] = useState<string | null>(null);
  const [fixNotification, setFixNotification] = useState<Record<string, string>>({});

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

  // [오타 수정] 버튼: 누르는 순간 모든 오타와 띄어쓰기를 즉시 자동 교정
  const handleAutoFixSpelling = async (sectionId: string) => {
    const originalText = answers[sectionId] || '';
    if (!originalText.trim()) {
      alert(t('오타 수정을 진행할 텍스트를 먼저 입력해주세요!'));
      return;
    }

    setFixingSectionId(sectionId);
    setFixNotification(prev => ({ ...prev, [sectionId]: '' }));

    // 1단계: 내장 정밀 한국어 맞춤법/띄어쓰기 엔진으로 즉각 로컬 교정
    const localResult = correctKoreanText(originalText);
    let bestCorrectedText = localResult.correctedText;

    try {
      // 2단계: 서버(AI/규정 기반) 보정 요청 시도
      const res = await fetch('/api/check-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.correctedText && typeof data.correctedText === 'string') {
          // 서버 결과에 다시 한 번 조사 및 공백 정밀 규칙 적용
          const combined = correctKoreanText(data.correctedText);
          bestCorrectedText = combined.correctedText;
        }
      }
    } catch (err) {
      console.warn('API error, using built-in Korean spell corrector', err);
    } finally {
      // 3단계: 화면 본문 텍스트 즉각 업데이트!
      handleChange(sectionId, bestCorrectedText);

      if (bestCorrectedText.trim() === originalText.trim()) {
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t('✨ 이미 오타나 띄어쓰기 오류가 없는 올바른 문장입니다!')
        }));
      } else {
        setFixNotification(prev => ({
          ...prev,
          [sectionId]: t('✨ 모든 오타와 띄어쓰기가 깔끔하게 수정되었습니다!')
        }));
      }

      setTimeout(() => {
        setFixNotification(prev => ({ ...prev, [sectionId]: '' }));
      }, 4000);

      setFixingSectionId(null);
    }
  };

  // Insert diary snippet
  const handleInsertDiary = (sectionId: string, diary: DiaryEntry) => {
    const prev = answers[sectionId] || '';
    const addition = `[${diary.date} ${diary.title}]\n${diary.content}\n`;
    const newText = prev ? `${prev}\n\n${addition}` : addition;
    handleChange(sectionId, newText);
    setSelectedDiary(null);
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
            const isTipOpen = !!showTips[sec.id];
            const hasDiaryHelper = !!sec.enableDiaryHelper;
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
                {/* Header: Clean Title + Right Controls ([작성 팁], [오타 수정], [비우기]) */}
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

                  {/* Buttons: [작성 팁], [오타 수정], [비우기] */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Tips & Guidance button */}
                    <button
                      type="button"
                      onClick={() => setShowTips(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isTipOpen
                          ? isLightMode ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : isLightMode ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-100" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                      title={t('작성 팁 및 부가 설명 보기')}
                    >
                      <Sparkles size={12} className={isTipOpen ? "text-emerald-600" : "text-amber-500"} />
                      <span>{t('작성 팁')}</span>
                      {isTipOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* [오타 수정] 버튼: 누르는 순간 모든 오타와 띄어쓰기 즉시 수정 */}
                    <button
                      type="button"
                      disabled={isFixing}
                      onClick={() => handleAutoFixSpelling(sec.id)}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isFixing
                          ? "bg-amber-100 text-amber-800 border-amber-300 cursor-wait"
                          : isLightMode 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-2xs" 
                            : "bg-emerald-950/60 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60"
                      }`}
                      title={t('누르면 본문의 모든 오타와 띄어쓰기를 즉시 자동 수정합니다')}
                    >
                      {isFixing ? (
                        <>
                          <RefreshCw size={12} className="animate-spin text-amber-600" />
                          <span>{t('수정 중...')}</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{t('오타 수정')}</span>
                        </>
                      )}
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

                {/* Collapsible Tips */}
                {isTipOpen && (
                  <div className={`px-5 py-3 border-b text-xs space-y-1.5 animate-in fade-in-50 duration-150 ${
                    isLightMode ? "bg-emerald-50/40 border-emerald-100 text-slate-700" : "bg-emerald-950/20 border-emerald-900/40 text-slate-300"
                  }`}>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                      <Sparkles size={13} />
                      <span>{t('작성 핵심 팁 및 가이드')}</span>
                    </div>
                    {sec.tips.map((tip, tIdx) => (
                      <p key={tIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{t(tip)}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Growth Diary Helper Row (Only on growth & practice sections) */}
                {hasDiaryHelper && (
                  <div className={`px-4 sm:px-5 py-3 border-b text-xs ${
                    isLightMode ? "bg-slate-50/80 border-slate-100" : "bg-slate-800/40 border-slate-800/80"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <BookOpen size={14} className="text-emerald-500" />
                        <span>{t('내가 작성한 성장 다이어리 기록')}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({t('클릭하여 내용 확인 및 본문 인용')})
                        </span>
                      </div>
                      <Link 
                        to="/diary" 
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{t('다이어리 더 쓰러가기')}</span>
                        <ExternalLink size={10} />
                      </Link>
                    </div>

                    {diaries.length === 0 ? (
                      <div className={`p-3 rounded-xl border text-center text-xs text-slate-400 ${
                        isLightMode ? "bg-white border-slate-200" : "bg-slate-800/60 border-slate-700"
                      }`}>
                        <span>{t('아직 등록된 다이어리가 없습니다. 성장다이어리에 실습 기록을 남겨보세요!')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {diaries.map((diary) => (
                          <button
                            key={diary.id || diary.date + diary.title}
                            type="button"
                            onClick={() => {
                              setSelectedDiary(diary);
                              setActiveDiarySectionId(sec.id);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left shrink-0 max-w-[260px] transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shadow-2xs ${
                              isLightMode 
                                ? "bg-white border-slate-200/90 hover:border-emerald-400 text-slate-800 hover:bg-emerald-50/20" 
                                : "bg-slate-800/90 border-slate-700 hover:border-emerald-500 text-slate-200 hover:bg-slate-800"
                            }`}
                          >
                            <span className="text-base shrink-0">{diary.mood || '📝'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs truncate leading-snug">
                                {diary.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {diary.date}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-fix Notification Message if any */}
                {notif && (
                  <div className={`px-4 sm:px-5 py-2.5 border-b text-xs flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Check size={14} className="text-emerald-600" />
                      <span>{notif}</span>
                    </div>
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
                      className={`text-xs font-extrabold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
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
                          <span>{t('오타 및 띄어쓰기 수정 중...')}</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          <span>{t('⚡ 오타·띄어쓰기 바로 수정하기')}</span>
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
