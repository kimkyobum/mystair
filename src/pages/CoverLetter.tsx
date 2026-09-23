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
  RotateCcw,
  Plus,
  Edit3,
  Lightbulb,
  AlertCircle
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
  isCustom?: boolean;
}

// 5개 기본 항목
const DEFAULT_SECTIONS: CoverLetterSection[] = [
  {
    id: 'growth',
    title: '1. 성장과정',
    recommendedChars: 500,
    placeholder: '학창 시절 및 지금까지의 생활에서 가치관을 형성하게 된 중요한 계기나 경험을 서술하세요.',
    isCustom: false
  },
  {
    id: 'intro',
    title: '2. 자기소개',
    recommendedChars: 400,
    placeholder: '자신을 가장 잘 드러내는 한 줄의 키워드와 함께, 어떤 인재인지 간결하고 명확하게 소개하세요.',
    isCustom: false
  },
  {
    id: 'strengths',
    title: '3. 장점',
    recommendedChars: 400,
    placeholder: '자신의 가장 큰 강점과, 그 강점이 실무나 협업 현장에서 긍정적으로 발휘된 경험을 서술하세요.',
    isCustom: false
  },
  {
    id: 'weaknesses',
    title: '4. 단점',
    recommendedChars: 400,
    placeholder: '자신이 가진 부족한 점을 솔직하게 인정하고, 이를 보완하기 위해 실천 중인 구체적인 노력과 루틴을 서술하세요.',
    isCustom: false
  },
  {
    id: 'practice',
    title: '5. 실습경험',
    recommendedChars: 600,
    placeholder: '전공 실습, 프로젝트, 자격증 취득, 경진대회 중 부딪힌 문제와 이를 해결한 과정(행동 및 배운 점)을 서술하세요.',
    isCustom: false
  }
];

// 자주 묻는 기업 자소서 질문 프리셋 추천
const PRESET_QUESTIONS = [
  {
    title: '지원동기 및 입사 후 포부',
    recommendedChars: 700,
    placeholder: '해당 기업 및 직무에 지원하게 된 결정적인 이유와, 입사 후 3~5년 내에 기여하고 싶은 구체적인 목표를 서술하세요.'
  },
  {
    title: '직무 수행 역량 및 프로젝트 경험',
    recommendedChars: 600,
    placeholder: '지원 직무와 관련된 전공 지식, 자격증, 실무 실습이나 프로젝트를 수행하며 이뤄낸 성과와 배운 점을 서술하세요.'
  },
  {
    title: '협업 및 갈등 해결 경험',
    recommendedChars: 500,
    placeholder: '팀 프로젝트나 단체 생활 중 발생했던 의견 충돌이나 난관을 원활한 소통과 배려로 해결해낸 경험을 서술하세요.'
  },
  {
    title: '도전적인 목표 달성 및 극복 경험',
    recommendedChars: 500,
    placeholder: '자신의 한계를 뛰어넘기 위해 높은 목표를 세우고 끈기 있게 도전하여 성과를 이뤄낸 과정을 서술하세요.'
  },
  {
    title: '창의적 문제 해결 경험',
    recommendedChars: 500,
    placeholder: '기존의 방식에서 벗어나 새로운 아이디어나 개선안을 제안하여 비효율이나 문제를 해결한 사례를 서술하세요.'
  }
];

export default function CoverLetter() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const { user, userProfile, fetchDiaries } = useAuth();

  const userKey = user?.uid ? `mystair_cover_letter_v2_${user.uid}` : 'mystair_cover_letter_v2_guest';

  // Sections list state (persisted to localStorage)
  const [sections, setSections] = useState<CoverLetterSection[]>(() => {
    try {
      const saved = localStorage.getItem(`${userKey}_sections`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SECTIONS;
  });

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
  const [openExperiences, setOpenExperiences] = useState<Record<string, boolean>>({});

  // Auto-fixing state per section & undo history
  const [fixingSectionId, setFixingSectionId] = useState<string | null>(null);
  const [fixNotification, setFixNotification] = useState<Record<string, string>>({});
  const [undoHistory, setUndoHistory] = useState<Record<string, string>>({});

  // Adding Custom Section State
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newChars, setNewChars] = useState<number>(500);
  const [newPlaceholder, setNewPlaceholder] = useState<string>('');

  // Editing Section State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editChars, setEditChars] = useState<number>(500);

  // Diary entries from Growth Diary
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [activeDiarySectionId, setActiveDiarySectionId] = useState<string | null>(null);

  // Sync state when user changes
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem(`${userKey}_sections`);
      if (savedSections) {
        const parsed = JSON.parse(savedSections);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        }
      }
      const savedAnswers = localStorage.getItem(userKey);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    } catch (e) {
      console.error(e);
    }
  }, [userKey]);

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
      localStorage.setItem(`${userKey}_sections`, JSON.stringify(sections));
      localStorage.setItem(`${userKey}_target_company`, targetCompany);
      localStorage.setItem(`${userKey}_target_role`, targetRole);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setSavedTime(timeStr);
      if (!silent) {
        alert(t('자기소개서와 추가 문항이 안전하게 저장되었습니다!'));
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
  }, [answers, sections, targetCompany, targetRole]);

  // Section answer change
  const handleChange = (id: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: text
    }));
  };

  // Clear single section content
  const handleClearSection = (id: string) => {
    if (window.confirm(t('이 항목의 작성 내용을 모두 지우시겠습니까?'))) {
      handleChange(id, '');
      setFixNotification(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Add Custom Section
  const handleAddCustomSection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      alert(t('질문(문항 내용)을 입력해주세요!'));
      return;
    }

    // Format title with numbering if not already starting with a number
    let formattedTitle = trimmed;
    if (!/^\d+[\.\)]\s*/.test(trimmed)) {
      formattedTitle = `${sections.length + 1}. ${trimmed}`;
    }

    const newId = `custom_${Date.now()}`;
    const newSec: CoverLetterSection = {
      id: newId,
      title: formattedTitle,
      recommendedChars: Math.max(50, Number(newChars) || 500),
      placeholder: newPlaceholder.trim() || '해당 문항에 대한 답변을 구체적인 경험과 근거를 바탕으로 서술하세요.',
      isCustom: true
    };

    const updatedSections = [...sections, newSec];
    setSections(updatedSections);
    try {
      localStorage.setItem(`${userKey}_sections`, JSON.stringify(updatedSections));
    } catch (err) {
      console.error(err);
    }

    // Reset create state
    setNewTitle('');
    setNewChars(500);
    setNewPlaceholder('');
    setIsAddingSection(false);

    // Scroll to the newly created section box
    setTimeout(() => {
      const el = document.getElementById(`section-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const textarea = el.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    }, 150);
  };

  // Delete Custom Section
  const handleDeleteSection = (id: string, title: string) => {
    if (window.confirm(t(`'${title}' 문항을 완전히 삭제하시겠습니까?\n작성된 내용도 함께 삭제됩니다.`))) {
      const updated = sections.filter(s => s.id !== id);
      setSections(updated);
      try {
        localStorage.setItem(`${userKey}_sections`, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      setAnswers(prev => {
        const copy = { ...prev };
        delete copy[id];
        try {
          localStorage.setItem(userKey, JSON.stringify(copy));
        } catch (err) {
          console.error(err);
        }
        return copy;
      });
      setOpenExperiences(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setFixNotification(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setUndoHistory(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // Start editing a section title/recommendedChars
  const handleStartEdit = (sec: CoverLetterSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditChars(sec.recommendedChars);
  };

  // Save edited section
  const handleSaveEdit = (secId: string) => {
    if (!editTitle.trim()) {
      alert(t('질문 제목을 입력해주세요!'));
      return;
    }
    const updated = sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          title: editTitle.trim(),
          recommendedChars: Math.max(50, Number(editChars) || 500)
        };
      }
      return s;
    });
    setSections(updated);
    try {
      localStorage.setItem(`${userKey}_sections`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setEditingSectionId(null);
  };

  // Reset to default 5 sections
  const handleResetToDefault = () => {
    if (window.confirm(t('기본 5개 질문(성장과정, 자기소개, 장점, 단점, 실습경험)으로 초기화하시겠습니까?\n직접 추가한 문항들이 목록에서 제거됩니다.'))) {
      setSections(DEFAULT_SECTIONS);
      try {
        localStorage.setItem(`${userKey}_sections`, JSON.stringify(DEFAULT_SECTIONS));
      } catch (err) {
        console.error(err);
      }
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
        setUndoHistory(prev => ({ ...prev, [sectionId]: originalText }));
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

  // Insert diary snippet
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

  // Total characters count across all sections
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
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-black flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  <FileText className="text-emerald-500" size={22} />
                  <span>{t('자기소개서 작성')}</span>
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isLightMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                }`}>
                  {t('총')} {sections.length}{t('개 문항')}
                </span>
              </div>
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

        {/* Distinct Sections List */}
        <div className="space-y-6">
          {sections.map((sec, index) => {
            const currentVal = answers[sec.id] || '';
            const charCount = currentVal.length;
            const charCountNoSpace = currentVal.replace(/\s/g, '').length;
            const isExperienceOpen = !!openExperiences[sec.id];
            const isFixing = fixingSectionId === sec.id;
            const notif = fixNotification[sec.id];
            const isEditingThis = editingSectionId === sec.id;

            return (
              <div 
                id={`section-${sec.id}`}
                key={sec.id}
                className={`rounded-2xl border transition-all scroll-mt-24 ${
                  isLightMode 
                    ? "bg-white border-slate-200 shadow-xs hover:border-slate-300" 
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs"
                }`}
              >
                {/* Header: Clean Title + Right Controls ([내 경험], [비우기], [수정], [삭제]) */}
                <div className={`px-4 sm:px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLightMode ? "border-slate-100 bg-slate-50/50 rounded-t-2xl" : "border-slate-800/80 bg-slate-800/30 rounded-t-2xl"
                }`}>
                  {/* Title & Recommended Chars or Inline Edit Mode */}
                  {isEditingThis ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder={t('질문 제목을 입력하세요')}
                        className={`flex-1 border rounded-lg px-3 py-1.5 text-sm font-bold outline-none ${
                          isLightMode ? "bg-white border-emerald-500 text-slate-900" : "bg-slate-800 border-emerald-500 text-white"
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={50}
                            max={5000}
                            step={50}
                            value={editChars}
                            onChange={e => setEditChars(Number(e.target.value))}
                            className={`w-20 border rounded-lg px-2 py-1.5 text-xs font-bold text-center outline-none ${
                              isLightMode ? "bg-white border-slate-300 text-slate-900" : "bg-slate-800 border-slate-600 text-white"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-400">{t('자')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(sec.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>{t('저장')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSectionId(null)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            isLightMode ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base font-extrabold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        {sec.title}
                      </h2>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        isLightMode ? "bg-white border-slate-200 text-slate-600" : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}>
                        {sec.recommendedChars}{t('자 권장')}
                      </span>
                      {sec.isCustom && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          {t('직접 추가한 문항')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Buttons: [내 경험] (팝업 창), [수정], [비우기], [문항 삭제] */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* [내 경험] 토글 버튼 및 팝업 창 */}
                    <div className="relative">
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

                      {/* [내 경험] 클릭 시 버튼 바로 아래에 작게 뜨는 팝업 창 */}
                      {isExperienceOpen && (
                        <>
                          {/* 배경 클릭 시 닫기 */}
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setOpenExperiences(prev => ({ ...prev, [sec.id]: false }))} 
                          />

                          <div className={`absolute right-0 top-full mt-2 w-[300px] sm:w-[350px] z-40 rounded-2xl border shadow-2xl p-3.5 transition-all animate-in fade-in zoom-in-95 duration-150 ${
                            isLightMode 
                              ? "bg-white border-slate-200 text-slate-800" 
                              : "bg-slate-900 border-slate-700 text-slate-100 shadow-emerald-950/40"
                          }`}>
                            {/* 팝업 상단 바 */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5">
                                <BookOpen size={14} className="text-emerald-500" />
                                <span className="text-xs font-black tracking-tight">{t('내 경험 선택')}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {diaries.length}{t('개')}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setOpenExperiences(prev => ({ ...prev, [sec.id]: false }))}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title={t('닫기')}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* 경험 목록 컨텐츠 */}
                            {diaries.length === 0 ? (
                              <div className="text-center py-5 space-y-2">
                                <p className="text-xs text-slate-400 font-medium">{t('아직 등록된 경험 다이어리가 없습니다.')}</p>
                                <Link
                                  to="/diary"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs"
                                >
                                  <PlusCircle size={12} />
                                  <span>{t('다이어리 작성하기')}</span>
                                </Link>
                              </div>
                            ) : (
                              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                {diaries.map((diary) => (
                                  <div
                                    key={diary.id || diary.date + diary.title}
                                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                                      isLightMode 
                                        ? "bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white" 
                                        : "bg-slate-800/60 border-slate-700/80 hover:border-emerald-500 hover:bg-slate-800"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedDiary(diary);
                                        setActiveDiarySectionId(sec.id);
                                      }}
                                      className="font-bold text-xs truncate text-left flex-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                      title={`${diary.title} (${t('클릭하여 상세 내용 확인')})`}
                                    >
                                      {diary.title}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleInsertDiary(sec.id, diary);
                                        setOpenExperiences(prev => ({ ...prev, [sec.id]: false }));
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                                      title={t('본문에 내용 인용')}
                                    >
                                      <span>{t('인용')}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 하단 보조 링크 */}
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-[10px] text-slate-400">{t('제목 클릭 시 상세 미리보기')}</span>
                              <Link
                                to="/diary"
                                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[11px]"
                              >
                                <span>{t('다이어리 추가')}</span>
                                <ExternalLink size={10} />
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Edit Section Title/Chars (Only for custom or non-editing) */}
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sec)}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isLightMode 
                            ? "bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 hover:border-slate-300" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-700"
                        }`}
                        title={t('문항 제목 및 권장 글자수 수정')}
                      >
                        <Edit3 size={12} />
                      </button>
                    )}

                    {/* Clear Text Content */}
                    {currentVal && (
                      <button
                        type="button"
                        onClick={() => handleClearSection(sec.id)}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border text-amber-600 dark:text-amber-400 transition-colors cursor-pointer ${
                          isLightMode ? "bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-200" : "bg-slate-800 border-slate-700 hover:bg-amber-950/50"
                        }`}
                        title={t('작성 내용 비우기')}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}

                    {/* Delete Question (Only for Custom Sections) */}
                    {sec.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id, sec.title)}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border text-rose-500 transition-colors cursor-pointer ${
                          isLightMode ? "bg-white border-slate-200 hover:bg-rose-50 hover:border-rose-200" : "bg-slate-800 border-slate-700 hover:bg-rose-950/50"
                        }`}
                        title={t('이 문항 완전히 삭제')}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

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
                    placeholder={sec.placeholder}
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

        {/* 자기소개서 질문 추가 버튼 & 입력 폼 */}
        <div className="mt-8">
          {!isAddingSection ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSection(true);
                  setNewTitle(`${sections.length + 1}. `);
                }}
                className={`flex-1 w-full py-4 px-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3.5 font-bold transition-all cursor-pointer group shadow-2xs hover:scale-[1.008] active:scale-[0.995] ${
                  isLightMode
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500"
                    : "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Plus size={20} strokeWidth={2.6} />
                </div>
                <div className="text-left">
                  <div className="text-base font-black flex items-center gap-2">
                    <span>{t('자기소개서 질문 추가')}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {t('자유 질문')}
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('가고 싶은 기업의 실제 채용 질문과 권장 글자수를 추가해 맞춤 작성 박스를 만드세요')}
                  </p>
                </div>
              </button>

              {/* 기본 5개 문항으로 초기화 (커스텀 문항이 있을 경우 표시) */}
              {sections.some(s => s.isCustom) && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className={`px-4 py-4 rounded-2xl border text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    isLightMode 
                      ? "border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50" 
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  }`}
                  title={t('기본 5개 문항으로 되돌리기')}
                >
                  {t('기본 문항으로 초기화')}
                </button>
              )}
            </div>
          ) : (
            <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isLightMode 
                ? "bg-white border-emerald-500/90 shadow-emerald-500/5" 
                : "bg-slate-900 border-emerald-500/70 shadow-black/50"
            }`}>
              {/* Creator Box Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${isLightMode ? "text-slate-900" : "text-white"}`}>
                      {t('새로운 자기소개서 질문 추가')}
                    </h3>
                    <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                      {t('질문 제목과 권장 글자수를 입력하면 맨 밑에 바로 작성 박스가 생성됩니다.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isLightMode ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Recommended Presets */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
                  <Lightbulb size={13} className="text-amber-500" />
                  {t('자주 나오는 대표 문항 추천 (클릭 시 자동 입력)')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_QUESTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewTitle(`${sections.length + 1}. ${preset.title}`);
                        setNewChars(preset.recommendedChars);
                        setNewPlaceholder(preset.placeholder);
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                        isLightMode 
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-800" 
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500 hover:bg-slate-800/80 hover:text-emerald-300"
                      }`}
                    >
                      <span>+ {preset.title}</span>
                      <span className="ml-1 text-[10px] text-slate-400 font-semibold">({preset.recommendedChars}자)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form Fields */}
              <form onSubmit={handleAddCustomSection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{t('질문 (문항 제목)')} <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">{t('번호와 제목을 적어주세요')}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder={t(`예: ${sections.length + 1}. 지원동기 및 입사 후 포부`)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors ${
                        isLightMode 
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                          : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{t('권장 글자수')} <span className="text-rose-500">*</span></span>
                      <span className="text-[11px] text-slate-400 font-normal">{t('기준 글자수')}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={50}
                        max={5000}
                        step={50}
                        required
                        value={newChars}
                        onChange={e => setNewChars(Number(e.target.value))}
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors pr-10 ${
                          isLightMode 
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                            : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                        }`}
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                        {t('자')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Char Selection Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold">{t('글자수 빠른 선택')}:</span>
                  {[300, 400, 500, 600, 700, 800, 1000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewChars(num)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        newChars === num
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : isLightMode 
                            ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50" 
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500"
                      }`}
                    >
                      {num}{t('자')}
                    </button>
                  ))}
                </div>

                {/* Optional Placeholder / Guidance */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{t('작성 팁 / 가이드 안내 (선택)')}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{t('텍스트 입력창 안내 문구로 표시됩니다')}</span>
                  </label>
                  <input
                    type="text"
                    value={newPlaceholder}
                    onChange={e => setNewPlaceholder(e.target.value)}
                    placeholder={t('예: 지원 동기와 이를 증명할 수 있는 자신의 실무 경험을 서술하세요.')}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                        : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingSection(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {t('취소')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>{t('질문 추가하고 박스 만들기')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
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
