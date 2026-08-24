import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Check, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Award,
  Settings,
  X,
  List,
  Edit3,
  CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, DiaryEntry } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import ReactMarkdown from 'react-markdown';

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MOOD_OPTIONS = [
  { emoji: '🔥', label: '열정적' },
  { emoji: '😊', label: '성취감' },
  { emoji: '💡', label: '깨달음' },
  { emoji: '🌱', label: '성장중' },
  { emoji: '😌', label: '평온함' },
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface ExamSchedule {
  firstMid: { start: string; end: string; name: string; color: string };
  firstFinal: { start: string; end: string; name: string; color: string };
  secondMid: { start: string; end: string; name: string; color: string };
  secondFinal: { start: string; end: string; name: string; color: string };
}

const DEFAULT_EXAM_SCHEDULE: ExamSchedule = {
  firstMid: { start: '', end: '', name: '1학기 중간고사', color: 'bg-amber-100 text-amber-900 border-amber-400' },
  firstFinal: { start: '', end: '', name: '1학기 기말고사', color: 'bg-rose-100 text-rose-900 border-rose-400' },
  secondMid: { start: '', end: '', name: '2학기 중간고사', color: 'bg-indigo-100 text-indigo-900 border-indigo-500' },
  secondFinal: { start: '', end: '', name: '2학기 기말고사', color: 'bg-purple-100 text-purple-900 border-purple-400' },
};

const SAMPLE_EXAM_SCHEDULE: ExamSchedule = {
  firstMid: { start: '2026-04-20', end: '2026-04-23', name: '1학기 중간고사', color: 'bg-amber-100 text-amber-900 border-amber-400' },
  firstFinal: { start: '2026-06-22', end: '2026-06-25', name: '1학기 기말고사', color: 'bg-rose-100 text-rose-900 border-rose-400' },
  secondMid: { start: '2026-10-19', end: '2026-10-22', name: '2학기 중간고사', color: 'bg-indigo-100 text-indigo-900 border-indigo-500' },
  secondFinal: { start: '2026-12-14', end: '2026-12-17', name: '2학기 기말고사', color: 'bg-purple-100 text-purple-900 border-purple-400' },
};

export default function Diary() {
  const { fetchDiaries, saveDiary, deleteDiary, user } = useAuth();
  const { t, language } = useLanguage();
  const { isLightMode } = useTheme();

  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View mode: 'calendar' or 'list'
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    certificates: any[];
    activities: any[];
    awards: any[];
    others: any[];
  } | null>(null);
  const [activeSummaryTab, setActiveSummaryTab] = useState<'certificates' | 'activities' | 'awards' | 'others'>('certificates');
  const [expandedSummaryIndex, setExpandedSummaryIndex] = useState<number | null>(null);

  const handleSummarizeDiaries = async () => {
    setShowSummaryModal(true);
    setSummaryLoading(true);
    setSummaryText(null);
    setSummaryData(null);
    setExpandedSummaryIndex(null);

    const profileData = localStorage.getItem('mystair_profile') || '';
    
    const message = `지금까지 작성한 모든 성장 다이어리(일기) 기록과 프로필 정보를 완벽히 분석해서, 자기소개서에 즉시 활용할 수 있도록 **STAR 공법(Situation - Task - Action - Result)**을 기반으로 세분화된 자소서 맞춤형 요약을 작성해줘.

반드시 다른 군더더기 말 없이 아래 지정된 JSON 포맷으로만 응답을 반환해줘. 마크다운 기호 없이 순수한 JSON 텍스트 또는 \`\`\`json \`\`\` 마크다운 블록 내에 JSON만 있어야 해.

JSON 구조 규격:
{
  "certificates": [
    {
      "title": "자격증 명칭 또는 자격증 준비 행동 제목",
      "date": "이 행동을 본격적으로 진행한 날짜 (예: 2026.07.15, 다이어리 기록의 날짜 기준)",
      "situation": "상황에 대한 구체적 설명",
      "task": "당시 당면 과제 또는 달성하고자 한 구체적 목표",
      "action": "해결을 위해 내가 직접 수행한 노력과 행동",
      "result": "구체적인 성과 및 이 과정을 통해 배운 직무/내적 성장 역량"
    }
  ],
  "activities": [
    {
      "title": "대내외 활동, 프로젝트, 실습, 동아리 등 관련 활동 제목",
      "date": "활동을 한 날짜 (예: 2026.07.15)",
      "situation": "상황 설명",
      "task": "목표 및 직면 과제",
      "action": "내가 직접 주도하거나 수행한 해결 노력과 행동",
      "result": "활동 결과 및 배운 점과 내적 변화"
    }
  ],
  "awards": [
    {
      "title": "수상 실적, 교내외 대회, 성과, 목표 초과 달성 성과",
      "date": "해당 사건/행동을 한 날짜 (예: 2026.07.15)",
      "situation": "상황 설명",
      "task": "목표 및 달성하고 자 했던 과제",
      "action": "성과 달성을 위해 내가 취한 구체적 행동",
      "result": "최종 결과(수상, 성취 등) 및 이 경험을 통해 얻은 교훈"
    }
  ],
  "others": [
    {
      "title": "기타 성장 경험, 극복 사례, 일상의 성취 경험",
      "date": "해당 행동/경험 날짜 (예: 2026.07.15)",
      "situation": "상황 설명",
      "task": "목표 및 당면 문제",
      "action": "해결을 위해 취한 구체적 행동",
      "result": "결과 및 배운 점"
    }
  ]
}

주의사항:
1. 다이어리 기록에 해당 카테고리에 해당하는 내용이 없다면 빈 배열 \`[]\`로 설정해줘. 절대 속성을 누락시키지 마.
2. 날짜("date")는 해당 다이어리 일기 날짜를 참고하여 'YYYY.MM.DD' 또는 '몇월 몇일' 형태로 반드시 한눈에 들어오게 채워줘.
3. 구체적이고 생생하게 적어주고 전문적인 자소서 가이드의 따뜻한 톤앤매너로 작성해줘.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatHistory: [],
          userProfile: profileData ? JSON.parse(profileData) : null,
          diaries: diaries
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawResponse = data.response || '';
        setSummaryText(rawResponse);

        try {
          // Parse JSON block out of response
          let jsonText = rawResponse.trim();
          const jsonMatch = jsonText.match(/```(?:json)?([\s\S]*?)```/);
          if (jsonMatch) {
            jsonText = jsonMatch[1];
          }
          const parsed = JSON.parse(jsonText.trim());
          setSummaryData(parsed);
        } catch (parseErr) {
          console.error("JSON parse failed. Displaying raw markdown fallback.", parseErr);
          // We keep summaryText as fallback raw display
        }
      } else {
        setSummaryText(t('서버에서 요약을 생성하지 못했습니다.'));
      }
    } catch (e) {
      console.error(e);
      setSummaryText(t('요약 중 오류가 발생했습니다.'));
    } finally {
      setSummaryLoading(false);
    }
  };

  // Calendar State
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-indexed

  // Exam schedule state
  const [examSchedule, setExamSchedule] = useState<ExamSchedule>(DEFAULT_EXAM_SCHEDULE);

  const [showExamSettings, setShowExamSettings] = useState(false);

  // Form Modal for Selected Date / New Entry
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDayDiariesModal, setShowDayDiariesModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [mood, setMood] = useState('🔥');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['성장기록', '자격증']);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    const dayEntries = diaries.filter(d => d.date === selectedDate);
    if (dayEntries.length > 0) {
      setShowDayDiariesModal(true);
    }
  };

  const loadDiaryList = async () => {
    setLoading(true);
    try {
      const fetched = await fetchDiaries();
      if (fetched && fetched.length > 0) {
        setDiaries(fetched);
      } else {
        const uid = user?.uid || 'local-user';
        const saved = localStorage.getItem(`mystair_local_diaries_${uid}`);
        if (saved) {
          setDiaries(JSON.parse(saved));
        } else {
          // Only show sample starter diaries for non-logged-in guest 'local-user'
          if (uid === 'local-user') {
            setDiaries([{
              id: 'sample-1',
              userId: 'local',
              title: t('정보처리기능사 실기 공부 3일차'),
              content: t('오늘 알고리즘 문제 5개를 풀었다. 정렬 알고리즘 개념이 이제서야 완전히 이해되었다! 내일은 데이터베이스 SQL 기출문제를 집중 정리해야겠다.'),
              date: getLocalDateString(),
              mood: '🔥',
              tags: ['정보처리기능사', '알고리즘', '목표달성']
            }]);
          } else {
            setDiaries([]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiaryList();

    const handleDiaryUpdate = () => {
      loadDiaryList();
    };
    window.addEventListener('diaryUpdated', handleDiaryUpdate);

    // Load user specific exam schedule
    const uid = user?.uid || 'local-user';
    const saved = localStorage.getItem(`mystair_exam_schedule_${uid}`);
    if (saved) {
      try {
        setExamSchedule(JSON.parse(saved));
      } catch (e) {
        setExamSchedule(DEFAULT_EXAM_SCHEDULE);
      }
    } else {
      setExamSchedule(DEFAULT_EXAM_SCHEDULE);
    }

    return () => {
      window.removeEventListener('diaryUpdated', handleDiaryUpdate);
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveExamSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = user?.uid || 'local-user';
    localStorage.setItem(`mystair_exam_schedule_${uid}`, JSON.stringify(examSchedule));
    setShowExamSettings(false);
    showToast(t('시험 일정이 성공적으로 저장되었습니다!'));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  // Open modal for a specific date cell
  const handleOpenDayModal = (dateStr: string, entryId?: string) => {
    setSelectedDate(dateStr);
    const existing = entryId ? diaries.find(d => d.id === entryId) : null;
    if (existing) {
      setEditingId(existing.id || null);
      setTitle(existing.title);
      setContent(existing.content);
      setMood(existing.mood || '🔥');
      setTags(existing.tags || ['성장기록']);
      setShowFormModal(true);
    } else {
      // Check if there are diaries for this day
      const dayEntries = diaries.filter(d => d.date === dateStr);
      if (dayEntries.length > 0) {
        setShowDayDiariesModal(true);
      } else {
        setEditingId(null);
        setTitle('');
        setContent('');
        setMood('🔥');
        setTags(['성장기록']);
        setShowFormModal(true);
      }
    }
  };

  const handleSubmitDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast(t('제목과 내용을 입력해주세요.'));
      return;
    }

    try {
      await saveDiary({
        title: title.trim(),
        content: content.trim(),
        date: selectedDate,
        mood,
        tags
      });
      showToast(t('성장 다이어리가 성공적으로 저장되었습니다!'));
      setShowFormModal(false);
      await loadDiaryList();
      // Reopen or open list modal after saving so they see all diaries
      setShowDayDiariesModal(true);
    } catch (err) {
      console.error(err);
      showToast(t('저장 중 오류가 발생했습니다.'));
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm(t('이 다이어리 기록을 삭제하시겠습니까?'))) return;

    try {
      await deleteDiary(id);
      showToast(t('다이어리 기록이 삭제되었습니다.'));
      setShowFormModal(false);
      await loadDiaryList();
      // Reopen list modal only if there are other diaries remaining for this day
      const remaining = diaries.filter(d => d.date === selectedDate && d.id !== id);
      if (remaining.length > 0) {
        setShowDayDiariesModal(true);
      }
    } catch (err) {
      console.error(err);
      showToast(t('삭제 중 오류가 발생했습니다.'));
    }
  };

  // Check if a date string falls within an exam period
  const getExamForDate = (dateStr: string) => {
    if (!dateStr) return null;
    const { firstMid, firstFinal, secondMid, secondFinal } = examSchedule;

    if (firstMid.start && firstMid.end && dateStr >= firstMid.start && dateStr <= firstMid.end) {
      return firstMid;
    }
    if (firstFinal.start && firstFinal.end && dateStr >= firstFinal.start && dateStr <= firstFinal.end) {
      return firstFinal;
    }
    if (secondMid.start && secondMid.end && dateStr >= secondMid.start && dateStr <= secondMid.end) {
      return secondMid;
    }
    if (secondFinal.start && secondFinal.end && dateStr >= secondFinal.start && dateStr <= secondFinal.end) {
      return secondFinal;
    }
    return null;
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthFormatted = String(currentMonth + 1).padStart(2, '0');

  return (
    <div className={`h-full flex-1 overflow-hidden font-sans flex flex-col relative transition-colors duration-200 ${isLightMode ? "bg-slate-50 text-slate-900" : "bg-slate-950/45 text-white"}`}>
      {/* Soft Ambient Cosmic Glows */}
      <div className={`absolute top-[15%] left-[20%] w-[380px] h-[380px] rounded-full blur-[100px] pointer-events-none z-0 ${isLightMode ? "bg-indigo-200/20" : "bg-indigo-500/10"}`} />
      <div className={`absolute bottom-[25%] right-[15%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none z-0 ${isLightMode ? "bg-purple-200/20" : "bg-purple-500/10"}`} />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-indigo-500 animate-bounce">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className={`backdrop-blur-md h-[72px] w-full flex items-center justify-between px-6 sm:px-10 border-b sticky top-0 z-40 ${isLightMode ? "bg-white/80 border-slate-200" : "bg-slate-900/80 border-slate-800"}`}>
        <div className="flex items-center gap-3">
          <Link to="/" className={`transition ${isLightMode ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}>
            <ArrowLeft size={20} />
          </Link>
          <BookOpen size={24} className="text-indigo-500" />
          <h1 className={`text-xl font-black tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>{t('성장 다이어리')}</h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExamSettings(!showExamSettings)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${isLightMode ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40"}`}
          >
            <Settings size={15} />
            <span className="hidden sm:inline">{t('시험 일정 설정')}</span>
          </button>

          <div className={`p-1 rounded-2xl border flex items-center gap-1 ${isLightMode ? "bg-slate-100 border-slate-200" : "bg-slate-800 border-slate-700"}`}>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar' ? isLightMode ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-600 text-white shadow' : (isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <CalendarIcon size={14} />
              <span>{t('달력 보기')}</span>
            </button>
            <button
              onClick={() => handleSummarizeDiaries()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isLightMode ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>{t('자소서 요약')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex-1 min-h-0 max-w-[1000px] mx-auto w-full px-4 sm:px-8 py-3.5 flex flex-col overflow-hidden`}>

        {/* Exam Schedule Settings Collapsible Box */}
        {showExamSettings && (
          <form onSubmit={handleSaveExamSchedule} className={`rounded-3xl p-6 shadow-2xl space-y-4 animate-in max-h-[90vh] overflow-y-auto custom-scrollbar fade-in duration-200 border-2 ${isLightMode ? "bg-white border-amber-400/80 text-slate-900 shadow-amber-500/10" : "bg-slate-900/90 border-amber-500/50 text-white"}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLightMode ? "text-amber-700" : "text-amber-300"}`}>
                <GraduationCap size={20} className="text-amber-400" />
                <span>{t('1·2학기 중간 / 기말고사 시험 일정 설정')}</span>
              </h3>
              <button type="button" onClick={() => setShowExamSettings(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className={`text-xs ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
              {t('시험 기간을 설정하시면 성장 다이어리 달력에 📝 시험 그림 아이콘이 자동으로 표시됩니다.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1학기 중간고사 */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                  <span>📝 {t('1학기 중간고사')}</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={examSchedule.firstMid.start}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      firstMid: { ...examSchedule.firstMid, start: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={examSchedule.firstMid.end}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      firstMid: { ...examSchedule.firstMid, end: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                </div>
              </div>

              {/* 1학기 기말고사 */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
                  <span>💯 {t('1학기 기말고사')}</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={examSchedule.firstFinal.start}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      firstFinal: { ...examSchedule.firstFinal, start: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={examSchedule.firstFinal.end}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      firstFinal: { ...examSchedule.firstFinal, end: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                </div>
              </div>

              {/* 2학기 중간고사 */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
                  <span>📝 {t('2학기 중간고사')}</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={examSchedule.secondMid.start}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      secondMid: { ...examSchedule.secondMid, start: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={examSchedule.secondMid.end}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      secondMid: { ...examSchedule.secondMid, end: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                </div>
              </div>

              {/* 2학기 기말고사 */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs font-extrabold text-purple-400 flex items-center gap-1">
                  <span>🎓 {t('2학기 기말고사')}</span>
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={examSchedule.secondFinal.start}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      secondFinal: { ...examSchedule.secondFinal, start: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={examSchedule.secondFinal.end}
                    onChange={e => setExamSchedule({
                      ...examSchedule,
                      secondFinal: { ...examSchedule.secondFinal, end: e.target.value }
                    })}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setExamSchedule(DEFAULT_EXAM_SCHEDULE);
                  showToast(t('모든 일정을 비웠습니다.'));
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('일정 모두 비우기')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExamSchedule(SAMPLE_EXAM_SCHEDULE);
                  showToast(t('샘플 시험 일정이 적용되었습니다.'));
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('샘플 일정 채우기')}
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={16} />
                <span>{t('시험 일정 저장')}</span>
              </button>
            </div>
          </form>
        )}

        {/* CALENDAR VIEW (Sleek Cosmic Theme matching starry sky environment) */}
        <div className={`flex-1 min-h-0 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 flex flex-col justify-between relative z-10 transition-colors duration-200 ${isLightMode ? "bg-white/85 border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/50" : "bg-slate-900/40 border-white/15 text-white shadow-[0_12px_40px_-12px_rgba(99,102,241,0.25)]"}`}>
            
            {/* Header: Month title, Year subtitle, & Navigation controls */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b flex-none ${isLightMode ? "border-slate-200" : "border-white/5"}`}>
              <div className="text-center sm:text-left">
                <h2 className={`text-3xl sm:text-4xl font-black tracking-wider font-sans uppercase ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  {language === 'ko' ? `${currentMonth + 1}월` : MONTH_NAMES_EN[currentMonth]}
                </h2>
                <div className={`text-sm font-extrabold tracking-widest mt-0.5 ${isLightMode ? "text-indigo-600" : "text-indigo-500/80"}`}>
                  {currentYear}.{monthFormatted}
                </div>
              </div>

              {/* Month Switcher Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-xl border transition cursor-pointer ${isLightMode ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900" : "border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"}`}
                  title="이전 달"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className={`p-2 rounded-xl border transition cursor-pointer ${isLightMode ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900" : "border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"}`}
                  title="다음 달"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => handleOpenDayModal(getLocalDateString())}
                  className={`ml-2 px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${isLightMode ? "border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 shadow-xs" : "border-indigo-500/30 bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300"}`}
                >
                  <Plus size={15} />
                  <span>{t('일기 쓰기')}</span>
                </button>
              </div>
            </div>

            {/* Day Headers (Sleek sci-fi terminal styled pills) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center flex-none my-2.5">
              {/* SUN */}
              <div className={`font-extrabold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                SUN
              </div>
              {/* MON */}
              <div className={`font-bold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800/55 text-slate-300 border-slate-700/40"}`}>
                MON
              </div>
              {/* TUE */}
              <div className={`font-bold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800/55 text-slate-300 border-slate-700/40"}`}>
                TUE
              </div>
              {/* WED */}
              <div className={`font-bold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800/55 text-slate-300 border-slate-700/40"}`}>
                WED
              </div>
              {/* THU */}
              <div className={`font-bold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800/55 text-slate-300 border-slate-700/40"}`}>
                THU
              </div>
              {/* FRI */}
              <div className={`font-bold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800/55 text-slate-300 border-slate-700/40"}`}>
                FRI
              </div>
              {/* SAT */}
              <div className={`font-extrabold text-xs py-1.5 rounded-lg border shadow-xs ${isLightMode ? "bg-sky-50 text-sky-600 border-sky-200" : "bg-sky-500/10 text-sky-400 border-sky-500/20"}`}>
                SAT
              </div>
            </div>

            {/* 7-Column Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1 min-h-0 auto-rows-fr">
              {/* Empty leading cells from previous month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                const prevDayNum = prevMonthDays - firstDayOfWeek + idx + 1;
                return (
                  <div 
                    key={`prev-${idx}`}
                    className={`rounded-xl border min-h-0 p-1 flex flex-col opacity-30 select-none ${isLightMode ? "bg-slate-100 border-slate-200" : "bg-slate-950/20 border-white/5"}`}
                  >
                    <span className={`text-xs font-bold ${isLightMode ? "text-slate-400" : "text-slate-600"}`}>{prevDayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayStr = String(dayNum).padStart(2, '0');
                const fullDateStr = `${currentYear}-${monthFormatted}-${dayStr}`;

                const dayOfWeek = (firstDayOfWeek + idx) % 7; // 0 = Sun, 6 = Sat
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;

                const todayStr = getLocalDateString();
                const isToday = fullDateStr === todayStr;

                // Check for Diary entry on this day
                const diaryEntries = diaries.filter(d => d.date === fullDateStr);

                // Check for Exam on this day
                const exam = getExamForDate(fullDateStr);

                // Make exam badges dark, glowing, cosmic
                let examBadgeClass = isLightMode ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 text-amber-300 border-amber-500/30";
                if (exam) {
                  if (exam.name.includes("기말고사")) {
                    examBadgeClass = exam.name.includes("1학기") 
                      ? (isLightMode ? "bg-rose-100 text-rose-900 border-rose-300" : "bg-rose-500/10 text-rose-300 border-rose-500/25")
                      : (isLightMode ? "bg-purple-100 text-purple-900 border-purple-300" : "bg-purple-500/10 text-purple-300 border-purple-500/25");
                  } else {
                    examBadgeClass = exam.name.includes("1학기")
                      ? (isLightMode ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 text-amber-300 border-amber-500/25")
                      : (isLightMode ? "bg-indigo-100 text-indigo-900 border-indigo-300" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/25");
                  }
                }

                return (
                  <div
                    key={fullDateStr}
                    onClick={() => handleOpenDayModal(fullDateStr)}
                    className={`rounded-xl border-2 transition-all p-1.5 sm:p-2 flex flex-col justify-between min-h-0 cursor-pointer relative group ${
                      isToday 
                        ? (isLightMode ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md hover:border-indigo-600' : 'bg-indigo-950/45 border-indigo-500 ring-1 ring-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:border-indigo-500') 
                        : (isLightMode ? 'bg-white hover:bg-indigo-50/30 border-slate-200 hover:border-indigo-300 shadow-xs' : 'bg-slate-900/55 hover:bg-slate-800/85 border-white/15 hover:border-white/35 shadow-md hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)]')
                    }`}
                  >
                    {/* Header line inside date cell */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-bold ${
                        isSunday ? (isLightMode ? 'text-rose-600' : 'text-rose-400/90') : isSaturday ? (isLightMode ? 'text-sky-600' : 'text-sky-400/90') : (isLightMode ? 'text-slate-800' : 'text-slate-300')
                      }`}>
                        {dayNum}
                      </span>

                      {/* Today Badge */}
                      {isToday && (
                        <span className="bg-indigo-500 text-white text-[8px] font-black px-1 rounded border border-indigo-500 shadow-sm">
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Cell Content: Exam Badge & Diary Entry */}
                    <div className="space-y-1 my-1 flex-1 flex flex-col justify-center">
                      {/* EXAM BADGE DISPLAY */}
                      {exam && (
                        <div className={`p-1 rounded-lg border text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-xs animate-pulse ${examBadgeClass}`}>
                          <span>📝</span>
                          <span className="truncate">{t(exam.name)}</span>
                        </div>
                      )}

                      {/* DIARY ENTRY DISPLAY */}
                      {diaryEntries.length > 0 && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); handleOpenDayModal(fullDateStr); }}
                          className={`p-1 sm:p-1.5 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold truncate shadow-xs text-center border transition-colors ${
                            isLightMode 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 hover:border-indigo-300" 
                              : "bg-indigo-500/10 border-indigo-500/25 text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-500/40"
                          }`}
                        >
                          <span className="truncate">
                            📝 {language === 'ko' ? `다이어리 ${diaryEntries.length}개` : `${diaryEntries.length} Diaries`}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Hover add prompt if empty */}
                    {diaryEntries.length === 0 && !exam && (
                      <div className={`opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-center ${isLightMode ? "text-indigo-600" : "text-indigo-500"}`}>
                        + {t('일기 쓰기')}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
      </main>

      {/* SUMMARY MODAL */}
      {showSummaryModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"}`}>
          <div className={`border-2 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 ${isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-indigo-500/50 text-white"}`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 flex-none ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                <Sparkles size={20} className="text-amber-400 animate-pulse" />
                <span>{t('AI 자소서 경험 요약 (STAR 공법 분석)')}</span>
              </h3>
              <button onClick={() => setShowSummaryModal(false)} className={`p-1 transition-colors ${isLightMode ? "text-slate-400 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar markdown-body">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-400">{t('다이어리 기록을 분석하여 자소서 소재를 추출하고 있습니다...')}</p>
                  <p className="text-xs text-slate-500">{t('각 경험을 탭과 타임라인 날짜별 STAR 공법으로 완벽히 분류 중입니다.')}</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Category Filter Buttons */}
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 border-b pb-4 ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
                    <button
                      onClick={() => {
                        setActiveSummaryTab('certificates');
                        setExpandedSummaryIndex(null);
                      }}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'certificates' ? (isLightMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs' : 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md') : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300')
                      }`}
                    >
                      <span className="text-base mb-1">🏆</span>
                      <span className="text-xs font-bold">{t('자격증 노력')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSummaryTab('activities');
                        setExpandedSummaryIndex(null);
                      }}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'activities' ? (isLightMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs' : 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md') : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300')
                      }`}
                    >
                      <span className="text-base mb-1">👥</span>
                      <span className="text-xs font-bold">{t('대내외 활동')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSummaryTab('awards');
                        setExpandedSummaryIndex(null);
                      }}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'awards' ? (isLightMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs' : 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md') : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300')
                      }`}
                    >
                      <span className="text-base mb-1">🥇</span>
                      <span className="text-xs font-bold">{t('수상 및 성과')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSummaryTab('others');
                        setExpandedSummaryIndex(null);
                      }}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'others' ? (isLightMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs' : 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md') : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300')
                      }`}
                    >
                      <span className="text-base mb-1">💡</span>
                      <span className="text-xs font-bold">{t('기타 성장경험')}</span>
                    </button>
                  </div>

                  {/* Active Tab Content */}
                  <div className="space-y-4 pt-1">
                    {(!summaryData[activeSummaryTab] || summaryData[activeSummaryTab].length === 0) ? (
                      <div className={`flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border p-6 ${isLightMode ? "bg-slate-50 border-slate-200" : "bg-slate-800/20 border-slate-800"}`}>
                        <span className="text-3xl">📭</span>
                        <h4 className={`text-sm font-bold ${isLightMode ? "text-slate-800" : "text-slate-300"}`}>{t('추출된 경험이 아직 없습니다')}</h4>
                        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                          {t('해당 카테고리(자격증, 대내외활동 등) 관련 키워드가 다이어리나 프로필에 충분하지 않은 것 같아요. 일기에 관련 내용(시험, 실습, 성과, 대회 등)을 더 자세히 기록하면 AI가 정확히 분류해서 보여줍니다!')}
                        </p>
                      </div>
                    ) : (
                      summaryData[activeSummaryTab].map((item: any, idx: number) => {
                        const isExpanded = expandedSummaryIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                              isExpanded 
                                ? (isLightMode ? 'bg-indigo-50/50 border-indigo-500 shadow-xs' : 'bg-slate-800/60 border-indigo-500/60 shadow-lg') 
                                : (isLightMode ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-800/30 border-slate-800/80 hover:border-slate-700/80')
                            }`}
                          >
                            {/* 날짜 및 간결한 제목 버튼 (클릭 시 STAR 공법 토글) */}
                            <button
                              type="button"
                              onClick={() => setExpandedSummaryIndex(prev => prev === idx ? null : idx)}
                              className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors cursor-pointer select-none group"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                                <div className={`text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 transition-colors border ${isLightMode ? "bg-indigo-50 border-indigo-200 text-indigo-800 group-hover:bg-indigo-100" : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 group-hover:bg-indigo-500/30"}`}>
                                  <CalendarIcon size={14} className="text-indigo-500 shrink-0" />
                                  <span className="whitespace-nowrap">{item.date || t('날짜 미지정')}</span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-sm sm:text-base font-extrabold transition-colors truncate ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}`}>
                                    {t(item.title)}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                                  {isExpanded ? t('STAR 닫기') : t('STAR 공법 보기')}
                                </span>
                                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                  isExpanded
                                    ? (isLightMode ? 'bg-indigo-100 text-indigo-700 rotate-180' : 'bg-indigo-500/20 text-indigo-300 rotate-180')
                                    : (isLightMode ? 'bg-slate-100 text-slate-500 group-hover:text-slate-900' : 'bg-slate-800 text-slate-400 group-hover:text-white')
                                }`}>
                                  <ChevronDown size={16} />
                                </div>
                              </div>
                            </button>

                            {/* STAR 공법 상세 영역 (날짜 버튼 클릭 시에만 표시) */}
                            {isExpanded && (
                              <div className={`p-5 pt-4 border-t space-y-4 animate-in fade-in-50 duration-200 ${isLightMode ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-700/60"}`}>
                                {/* Situation */}
                                <div className="flex items-start gap-3">
                                  <span className="bg-amber-500/10 text-amber-400 text-xs font-black px-2 py-1 rounded-lg border border-amber-500/25 shrink-0 w-8 text-center" title="Situation">S</span>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-amber-300/80">Situation ({t('상황 배경')})</span>
                                    <p className={`text-sm leading-relaxed ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>{t(item.situation)}</p>
                                  </div>
                                </div>

                                {/* Task */}
                                <div className="flex items-start gap-3">
                                  <span className="bg-sky-500/10 text-sky-400 text-xs font-black px-2 py-1 rounded-lg border border-sky-500/25 shrink-0 w-8 text-center" title="Task">T</span>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-sky-300/80">Task ({t('목표와 과제')})</span>
                                    <p className={`text-sm leading-relaxed ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>{t(item.task)}</p>
                                  </div>
                                </div>

                                {/* Action */}
                                <div className="flex items-start gap-3">
                                  <span className="bg-indigo-500/10 text-indigo-400 text-xs font-black px-2 py-1 rounded-lg border border-indigo-500/25 shrink-0 w-8 text-center" title="Action">A</span>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-indigo-300/80">Action ({t('내가 취한 구체적 행동')})</span>
                                    <p className={`text-sm leading-relaxed font-bold ${isLightMode ? "text-slate-900" : "text-slate-200"}`}>{t(item.action)}</p>
                                  </div>
                                </div>

                                {/* Result */}
                                <div className="flex items-start gap-3">
                                  <span className="bg-purple-500/10 text-purple-400 text-xs font-black px-2 py-1 rounded-lg border border-purple-500/25 shrink-0 w-8 text-center" title="Result">R</span>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-extrabold text-purple-300/80">Result ({t('최종 성과 및 내적 성장')})</span>
                                    <p className={`text-sm leading-relaxed ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>{t(item.result)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback raw display in case of JSON parse errors */
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-amber-300">{t('구조화 탭 로딩 실패')}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t('AI 요약 데이터가 JSON 규격에 맞지 않아 일반 텍스트 형태로 출력합니다. 아래 분석글을 참고해 주세요.')}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed space-y-2 p-4 bg-slate-800/20 border border-slate-800 rounded-2xl">
                    <ReactMarkdown>{summaryText || ''}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAY DIARIES LIST MODAL */}
      {showDayDiariesModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"}`}>
          <div className={`border-2 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 ${isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-indigo-500/50 text-white"}`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-4 mb-4 flex-none ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
              <div className="flex items-center gap-2">
                <CalendarIcon size={20} className="text-indigo-500" />
                <h3 className="text-lg font-bold">
                  {language === 'ko' ? `${selectedDate} 성장 다이어리 목록` : `Growth Diary List (${selectedDate})`}
                </h3>
              </div>
              <button 
                onClick={() => setShowDayDiariesModal(false)}
                className={`p-1 transition-colors ${isLightMode ? "text-slate-400 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Add Diary Button at the top of list */}
            <div className="mb-4 flex-none">
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                  setMood('🔥');
                  setTags(['성장기록']);
                  setShowFormModal(true);
                  setShowDayDiariesModal(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Plus size={16} />
                <span>{language === 'ko' ? '새 성장 다이어리 추가' : 'Add New Growth Diary'}</span>
              </button>
            </div>

            {/* List of diaries */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {diaries.filter(d => d.date === selectedDate).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {language === 'ko' ? '기록된 다이어리가 없습니다.' : 'No diaries recorded.'}
                </div>
              ) : (
                diaries.filter(d => d.date === selectedDate).map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    onClick={() => {
                      setEditingId(entry.id || null);
                      setTitle(entry.title);
                      setContent(entry.content);
                      setMood(entry.mood || '🔥');
                      setTags(entry.tags || ['성장기록']);
                      setShowFormModal(true);
                      setShowDayDiariesModal(false);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200/60 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-800" 
                        : "bg-slate-800/40 border-slate-700/60 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className={`text-base font-extrabold leading-snug ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        {entry.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {entry.tags?.map((t, tIdx) => (
                          <span 
                            key={tIdx} 
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isLightMode ? "bg-indigo-50 text-indigo-700" : "bg-indigo-500/10 text-indigo-300"
                            }`}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* DIARY FORM MODAL FOR SELECTED DAY */}
      {showFormModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"}`}>
          <form 
            onSubmit={handleSubmitDiary}
            className={`border-2 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in max-h-[90vh] overflow-y-auto custom-scrollbar zoom-in-95 duration-150 ${isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-indigo-500/50 text-white"}`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                <CalendarCheck size={20} className={isLightMode ? "text-indigo-500" : "text-indigo-500"} />
                <span>{language === 'ko' ? `${selectedDate} 성장 다이어리 ${editingId ? '수정' : '작성'}` : `${editingId ? 'Edit' : 'Write'} Growth Diary (${selectedDate})`}</span>
              </h3>
              <button 
                type="button" 
                onClick={handleCloseFormModal}
                className={`p-1 transition-colors ${isLightMode ? "text-slate-400 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>{t('제목')}</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('예: 전기기능사 회로 실습 성공 기록')}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-colors ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"}`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>{t('날짜')}</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition-colors ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500" : "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>{t('오늘의 기분')}</label>
                  <div className={`flex items-center justify-between p-1.5 rounded-xl border h-[46px] ${isLightMode ? "bg-slate-50 border-slate-200" : "bg-slate-800 border-slate-700"}`}>
                    {MOOD_OPTIONS.map(m => (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => setMood(m.emoji)}
                        className={`flex-1 py-1 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
                          mood === m.emoji ? 'bg-indigo-600 scale-105 shadow text-base text-white' : (isLightMode ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-700/50 text-slate-400')
                        }`}
                        title={t(m.label)}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold font-sans ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>{t('오늘의 성장 기록 및 일기 내용')}</label>
              <textarea 
                rows={5}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={t('오늘 배운 실무 기술, 시험 공부 분량, 느낀 점을 자유롭게 기록해보세요...')}
                className={`w-full border rounded-xl p-4 text-sm font-medium outline-none leading-relaxed transition-colors ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500" : "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"}`}
                required
              />
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{t('일기 삭제')}</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                >
                  {t('취소')}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={16} />
                  <span>{editingId ? t('수정 완료') : t('일기 저장')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

