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
  secondMid: { start: '', end: '', name: '2학기 중간고사', color: 'bg-indigo-100 text-indigo-900 border-indigo-400' },
  secondFinal: { start: '', end: '', name: '2학기 기말고사', color: 'bg-purple-100 text-purple-900 border-purple-400' },
};

const SAMPLE_EXAM_SCHEDULE: ExamSchedule = {
  firstMid: { start: '2026-04-20', end: '2026-04-23', name: '1학기 중간고사', color: 'bg-amber-100 text-amber-900 border-amber-400' },
  firstFinal: { start: '2026-06-22', end: '2026-06-25', name: '1학기 기말고사', color: 'bg-rose-100 text-rose-900 border-rose-400' },
  secondMid: { start: '2026-10-19', end: '2026-10-22', name: '2학기 중간고사', color: 'bg-indigo-100 text-indigo-900 border-indigo-400' },
  secondFinal: { start: '2026-12-14', end: '2026-12-17', name: '2학기 기말고사', color: 'bg-purple-100 text-purple-900 border-purple-400' },
};

export default function Diary() {
  const { fetchDiaries, saveDiary, deleteDiary, user } = useAuth();

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

  const handleSummarizeDiaries = async () => {
    setShowSummaryModal(true);
    setSummaryLoading(true);
    setSummaryText(null);
    setSummaryData(null);

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
        setSummaryText('서버에서 요약을 생성하지 못했습니다.');
      }
    } catch (e) {
      console.error(e);
      setSummaryText('요약 중 오류가 발생했습니다.');
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [mood, setMood] = useState('🔥');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['성장기록', '자격증']);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
              title: '정보처리기능사 실기 공부 3일차',
              content: '오늘 알고리즘 문제 5개를 풀었다. 정렬 알고리즘 개념이 이제서야 완전히 이해되었다! 내일은 데이터베이스 SQL 기출문제를 집중 정리해야겠다.',
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
    showToast('시험 일정이 성공적으로 저장되었습니다!');
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
  const handleOpenDayModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = diaries.find(d => d.date === dateStr);
    if (existing) {
      setEditingId(existing.id || null);
      setTitle(existing.title);
      setContent(existing.content);
      setMood(existing.mood || '🔥');
      setTags(existing.tags || ['성장기록']);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setMood('🔥');
      setTags(['성장기록']);
    }
    setShowFormModal(true);
  };

  const handleSubmitDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.');
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
      showToast('성장 다이어리가 성공적으로 저장되었습니다!');
      setShowFormModal(false);
      loadDiaryList();
    } catch (err) {
      console.error(err);
      showToast('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('이 다이어리 기록을 삭제하시겠습니까?')) return;

    try {
      await deleteDiary(id);
      showToast('다이어리 기록이 삭제되었습니다.');
      setShowFormModal(false);
      loadDiaryList();
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
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
    <div className="h-full flex-1 overflow-hidden bg-slate-950/45 text-white font-sans flex flex-col relative">
      {/* Soft Ambient Cosmic Glows */}
      <div className="absolute top-[15%] left-[20%] w-[380px] h-[380px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[25%] right-[15%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-indigo-400 animate-bounce">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md h-[72px] w-full flex items-center justify-between px-6 sm:px-10 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <BookOpen size={24} className="text-indigo-400" />
          <h1 className="text-xl font-black tracking-tight text-white">성장 다이어리</h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExamSettings(!showExamSettings)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">시험 일정 설정</span>
          </button>

          <div className="bg-slate-800 p-1 rounded-2xl border border-slate-700 flex items-center gap-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon size={14} />
              <span>달력 보기</span>
            </button>
            <button
              onClick={() => handleSummarizeDiaries()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>자소서 요약</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex-1 min-h-0 max-w-[1000px] mx-auto w-full px-4 sm:px-8 py-3.5 flex flex-col overflow-hidden`}>

        {/* Exam Schedule Settings Collapsible Box */}
        {showExamSettings && (
          <form onSubmit={handleSaveExamSchedule} className="bg-slate-900/90 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <GraduationCap size={20} className="text-amber-400" />
                <span>1·2학기 중간 / 기말고사 시험 일정 설정</span>
              </h3>
              <button type="button" onClick={() => setShowExamSettings(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              시험 기간을 설정하시면 성장 다이어리 달력에 📝 시험 그림 아이콘이 자동으로 표시됩니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1학기 중간고사 */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                  <span>📝 1학기 중간고사</span>
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
                  <span>💯 1학기 기말고사</span>
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
                <label className="text-xs font-extrabold text-indigo-400 flex items-center gap-1">
                  <span>📝 2학기 중간고사</span>
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
                  <span>🎓 2학기 기말고사</span>
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
                  showToast('모든 일정을 비웠습니다.');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                일정 모두 비우기
              </button>
              <button
                type="button"
                onClick={() => {
                  setExamSchedule(SAMPLE_EXAM_SCHEDULE);
                  showToast('샘플 시험 일정이 적용되었습니다.');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                샘플 일정 채우기
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={16} />
                <span>시험 일정 저장</span>
              </button>
            </div>
          </form>
        )}

        {/* CALENDAR VIEW (Sleek Cosmic Theme matching starry sky environment) */}
        <div className="flex-1 min-h-0 bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-white border-2 border-white/15 shadow-[0_12px_40px_-12px_rgba(99,102,241,0.25)] flex flex-col justify-between relative z-10">
            
            {/* Header: Month title, Year subtitle, & Navigation controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-white/5 flex-none">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white font-sans uppercase">
                  {MONTH_NAMES_EN[currentMonth]}
                </h2>
                <div className="text-sm font-extrabold text-indigo-400/80 tracking-widest mt-0.5">
                  {currentYear}.{monthFormatted}
                </div>
              </div>

              {/* Month Switcher Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="이전 달"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="다음 달"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => handleOpenDayModal(getLocalDateString())}
                  className="ml-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus size={15} />
                  <span>일기 쓰기</span>
                </button>
              </div>
            </div>

            {/* Day Headers (Sleek sci-fi terminal styled pills) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center flex-none my-2.5">
              {/* SUN */}
              <div className="bg-rose-500/10 text-rose-400 font-extrabold text-xs py-1.5 rounded-lg border border-rose-500/20 shadow-sm">
                SUN
              </div>
              {/* MON */}
              <div className="bg-slate-800/55 text-slate-300 font-bold text-xs py-1.5 rounded-lg border border-slate-700/40 shadow-sm">
                MON
              </div>
              {/* TUE */}
              <div className="bg-slate-800/55 text-slate-300 font-bold text-xs py-1.5 rounded-lg border border-slate-700/40 shadow-sm">
                TUE
              </div>
              {/* WED */}
              <div className="bg-slate-800/55 text-slate-300 font-bold text-xs py-1.5 rounded-lg border border-slate-700/40 shadow-sm">
                WED
              </div>
              {/* THU */}
              <div className="bg-slate-800/55 text-slate-300 font-bold text-xs py-1.5 rounded-lg border border-slate-700/40 shadow-sm">
                THU
              </div>
              {/* FRI */}
              <div className="bg-slate-800/55 text-slate-300 font-bold text-xs py-1.5 rounded-lg border border-slate-700/40 shadow-sm">
                FRI
              </div>
              {/* SAT */}
              <div className="bg-sky-500/10 text-sky-400 font-extrabold text-xs py-1.5 rounded-lg border border-sky-500/20 shadow-sm">
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
                    className="bg-slate-950/20 rounded-xl border border-white/5 min-h-0 p-1 flex flex-col opacity-20 select-none"
                  >
                    <span className="text-xs font-bold text-slate-600">{prevDayNum}</span>
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
                const diaryEntry = diaries.find(d => d.date === fullDateStr);

                // Check for Exam on this day
                const exam = getExamForDate(fullDateStr);

                // Make exam badges dark, glowing, cosmic
                let examBadgeClass = "bg-amber-500/10 text-amber-300 border-amber-500/30";
                if (exam) {
                  if (exam.name.includes("기말고사")) {
                    examBadgeClass = exam.name.includes("1학기") 
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                      : "bg-purple-500/10 text-purple-300 border-purple-500/25";
                  } else {
                    examBadgeClass = exam.name.includes("1학기")
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/25";
                  }
                }

                return (
                  <div
                    key={fullDateStr}
                    onClick={() => handleOpenDayModal(fullDateStr)}
                    className={`rounded-xl border-2 transition-all p-1.5 sm:p-2 flex flex-col justify-between min-h-0 cursor-pointer relative group ${
                      isToday 
                        ? 'bg-indigo-950/45 border-indigo-500 ring-1 ring-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:border-indigo-400' 
                        : 'bg-slate-900/55 hover:bg-slate-800/85 border-white/15 hover:border-white/35 shadow-md hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {/* Header line inside date cell */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-bold ${
                        isSunday ? 'text-rose-400/90' : isSaturday ? 'text-sky-400/90' : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>

                      {/* Today Badge */}
                      {isToday && (
                        <span className="bg-indigo-500 text-white text-[8px] font-black px-1 rounded border border-indigo-400 shadow-sm">
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
                          <span className="truncate">{exam.name}</span>
                        </div>
                      )}

                      {/* DIARY ENTRY DISPLAY */}
                      {diaryEntry && (
                        <div className="bg-indigo-500/10 border border-indigo-500/25 p-1 sm:p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold text-indigo-200 truncate shadow-xs">
                          <span className="text-sm shrink-0">{diaryEntry.mood || '🔥'}</span>
                          <span className="truncate">{diaryEntry.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Hover add prompt if empty */}
                    {!diaryEntry && !exam && (
                      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-indigo-400 text-center">
                        + 일기 쓰기
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-none">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-amber-400 animate-pulse" />
                <span>AI 자소서 경험 요약 (STAR 공법 분석)</span>
              </h3>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar markdown-body">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-400">다이어리 기록을 분석하여 자소서 소재를 추출하고 있습니다...</p>
                  <p className="text-xs text-slate-500">각 경험을 탭과 타임라인 날짜별 STAR 공법으로 완벽히 분류 중입니다.</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Category Filter Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-800 pb-4">
                    <button
                      onClick={() => setActiveSummaryTab('certificates')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'certificates'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-base mb-1">🏆</span>
                      <span className="text-xs font-bold">자격증 노력</span>
                    </button>
                    <button
                      onClick={() => setActiveSummaryTab('activities')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'activities'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-base mb-1">👥</span>
                      <span className="text-xs font-bold">대내외 활동</span>
                    </button>
                    <button
                      onClick={() => setActiveSummaryTab('awards')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'awards'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-base mb-1">🥇</span>
                      <span className="text-xs font-bold">수상 및 성과</span>
                    </button>
                    <button
                      onClick={() => setActiveSummaryTab('others')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        activeSummaryTab === 'others'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-base mb-1">💡</span>
                      <span className="text-xs font-bold">기타 성장경험</span>
                    </button>
                  </div>

                  {/* Active Tab Content */}
                  <div className="space-y-4 pt-1">
                    {(!summaryData[activeSummaryTab] || summaryData[activeSummaryTab].length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-slate-800/20 rounded-2xl border border-slate-800 p-6">
                        <span className="text-3xl">📭</span>
                        <h4 className="text-sm font-bold text-slate-300">추출된 경험이 아직 없습니다</h4>
                        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                          해당 카테고리(자격증, 대내외활동 등) 관련 키워드가 다이어리나 프로필에 충분하지 않은 것 같아요. 일기에 관련 내용(시험, 실습, 성과, 대회 등)을 더 자세히 기록하면 AI가 정확히 분류해서 보여줍니다!
                        </p>
                      </div>
                    ) : (
                      summaryData[activeSummaryTab].map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/30 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm hover:border-indigo-500/30 transition-all">
                          {/* Card Header (Date & Title) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/50">
                            <h4 className="text-base font-extrabold text-white leading-snug flex items-center gap-2">
                              <span className="text-indigo-400 text-lg">✦</span> {item.title}
                            </h4>
                            <div className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 w-fit">
                              <CalendarIcon size={12} />
                              <span>{item.date || '날짜 미지정'}</span>
                            </div>
                          </div>

                          {/* STAR Methods Layout */}
                          <div className="space-y-4 pt-1">
                            {/* Situation */}
                            <div className="flex items-start gap-3">
                              <span className="bg-amber-500/10 text-amber-400 text-xs font-black px-2 py-1 rounded-lg border border-amber-500/25 shrink-0 w-8 text-center" title="Situation">S</span>
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-amber-300/80">Situation (상황 배경)</span>
                                <p className="text-sm text-slate-300 leading-relaxed">{item.situation}</p>
                              </div>
                            </div>

                            {/* Task */}
                            <div className="flex items-start gap-3">
                              <span className="bg-sky-500/10 text-sky-400 text-xs font-black px-2 py-1 rounded-lg border border-sky-500/25 shrink-0 w-8 text-center" title="Task">T</span>
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-sky-300/80">Task (목표와 과제)</span>
                                <p className="text-sm text-slate-300 leading-relaxed">{item.task}</p>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex items-start gap-3">
                              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-black px-2 py-1 rounded-lg border border-emerald-500/25 shrink-0 w-8 text-center" title="Action">A</span>
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-emerald-300/80">Action (내가 취한 구체적 행동)</span>
                                <p className="text-sm text-slate-200 leading-relaxed font-bold">{item.action}</p>
                              </div>
                            </div>

                            {/* Result */}
                            <div className="flex items-start gap-3">
                              <span className="bg-purple-500/10 text-purple-400 text-xs font-black px-2 py-1 rounded-lg border border-purple-500/25 shrink-0 w-8 text-center" title="Result">R</span>
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-purple-300/80">Result (최종 성과 및 내적 성장)</span>
                                <p className="text-sm text-slate-300 leading-relaxed">{item.result}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback raw display in case of JSON parse errors */
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-amber-300">구조화 탭 로딩 실패</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        AI 요약 데이터가 JSON 규격에 맞지 않아 일반 텍스트 형태로 출력합니다. 아래 분석글을 참고해 주세요.
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

      {/* DIARY FORM MODAL FOR SELECTED DAY */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmitDiary}
            className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck size={20} className="text-indigo-400" />
                <span>{selectedDate} 성장 다이어리 {editingId ? '수정' : '작성'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">제목</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 전기기능사 회로 실습 성공 기록"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">날짜</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">오늘의 기분</label>
                  <div className="flex items-center justify-between bg-slate-800 p-1.5 rounded-xl border border-slate-700 h-[46px]">
                    {MOOD_OPTIONS.map(m => (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => setMood(m.emoji)}
                        className={`flex-1 py-1 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center ${
                          mood === m.emoji ? 'bg-indigo-600 scale-105 shadow text-base' : 'hover:bg-slate-700/50 text-slate-400'
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 font-sans">오늘의 성장 기록 및 일기 내용</label>
              <textarea 
                rows={5}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="오늘 배운 실무 기술, 시험 공부 분량, 느낀 점을 자유롭게 기록해보세요..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-indigo-500 leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {editingId ? (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>일기 삭제</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={16} />
                  <span>{editingId ? '수정 완료' : '일기 저장'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

