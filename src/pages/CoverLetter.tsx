import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  Trash2, 
  Sparkles, 
  Check, 
  Clock,
  Building,
  Building2,
  BookOpen,
  Calendar,
  X,
  PlusCircle,
  Wand2,
  RefreshCw,
  Camera,
  RotateCcw,
  Plus,
  Edit3,
  Copy,
  Download,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Printer,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth, DiaryEntry } from '../context/AuthContext';
import { checkAndCorrectKoreanSpelling, correctKoreanText } from '../utils/koreanSpellChecker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CoverLetterSection {
  id: string;
  title: string;
  recommendedChars: number;
  placeholder: string;
  isCustom?: boolean;
}

export interface CompanyCoverLetter {
  id: string;
  companyName: string;
  sections: CoverLetterSection[];
  answers: Record<string, string>;
  updatedAt: string;
}

// Helper to extract clean question title without leading numbers
export const getCleanTitle = (title: string): string => {
  return title.replace(/^\s*\d+\s*[\.\,\:\)\-]\s*/, '').trim();
};

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
    title: '3. 성격 및 전공의 장점',
    recommendedChars: 600,
    placeholder: '성격의 긍정적인 면모와 전공 실습 또는 직무 분야에서 발휘할 수 있는 본인만의 강점을 사례와 함께 서술하세요.',
    isCustom: false
  },
  {
    id: 'weaknesses',
    title: '4. 보완할 점(단점)',
    recommendedChars: 400,
    placeholder: '자신의 부족한 점을 솔직하게 인정하고, 이를 개선하거나 보완하기 위해 실천 중인 구체적인 노력을 서술하세요.',
    isCustom: false
  },
  {
    id: 'practice',
    title: '5. 실습 경험 및 직무 역량',
    recommendedChars: 700,
    placeholder: '학교 실습, 프로젝트, 자격증 취득 등 희망 직무와 직접적으로 관련된 실무 역량과 성과를 구체적으로 기술하세요.',
    isCustom: false
  }
];

// 마이스터고/특성화고 학생들이 자주 지원하는 대표 기업 프리셋
const POPULAR_COMPANIES = [
  '삼성전자',
  '현대자동차',
  'LG에너지솔루션',
  'SK하이닉스',
  '한국전력공사',
  '포스코',
  '한국철도공사 (코레일)',
  '한화에어로스페이스',
  '한국수력원자력',
  'CJ제일제당'
];

export default function CoverLetter() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const { user, userProfile, fetchDiaries } = useAuth();

  const userKey = user?.uid ? `mystair_cover_letter_v2_${user.uid}` : 'mystair_cover_letter_v2_guest';

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Company Collections State
  const [companies, setCompanies] = useState<CompanyCoverLetter[]>(() => {
    try {
      const savedCollection = localStorage.getItem(`${userKey}_company_letters`);
      if (savedCollection) {
        const parsed = JSON.parse(savedCollection);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: CompanyCoverLetter) => ({
            ...c,
            sections: (c.sections || DEFAULT_SECTIONS).map((s: CoverLetterSection, idx: number) => ({
              ...s,
              title: `${idx + 1}. ${getCleanTitle(s.title)}`
            }))
          }));
        }
      }

      // Legacy migration from previous single-company state
      const legacySectionsStr = localStorage.getItem(`${userKey}_sections`);
      const legacyAnswersStr = localStorage.getItem(userKey);
      const legacyCompany = localStorage.getItem(`${userKey}_target_company`) || userProfile?.targetCompanies?.[0] || '기본 지원 (자유 양식)';
      
      const parsedSections: CoverLetterSection[] = legacySectionsStr ? JSON.parse(legacySectionsStr) : DEFAULT_SECTIONS;
      let parsedAnswers: Record<string, string> = {
        growth: '',
        intro: '',
        strengths: '',
        weaknesses: '',
        practice: ''
      };
      if (legacyAnswersStr) {
        try {
          parsedAnswers = JSON.parse(legacyAnswersStr);
        } catch {
          // ignore
        }
      }

      const defaultComp: CompanyCoverLetter = {
        id: `comp_${Date.now()}`,
        companyName: legacyCompany.trim() || '기본 지원 (자유 양식)',
        sections: parsedSections.map((s, idx) => ({ ...s, title: `${idx + 1}. ${getCleanTitle(s.title)}` })),
        answers: parsedAnswers,
        updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      return [defaultComp];
    } catch (e) {
      console.error(e);
      return [{
        id: `comp_${Date.now()}`,
        companyName: '기본 지원 (자유 양식)',
        sections: DEFAULT_SECTIONS,
        answers: { growth: '', intro: '', strengths: '', weaknesses: '', practice: '' },
        updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }];
    }
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem(`${userKey}_active_company_id`);
      return savedActive || '';
    } catch {
      return '';
    }
  });

  // Ensure activeCompanyId is always valid
  useEffect(() => {
    if (!companies.some(c => c.id === activeCompanyId)) {
      if (companies.length > 0) {
        setActiveCompanyId(companies[0].id);
      }
    }
  }, [companies, activeCompanyId]);

  // Sync state when user changes
  useEffect(() => {
    try {
      const savedCollection = localStorage.getItem(`${userKey}_company_letters`);
      if (savedCollection) {
        const parsed = JSON.parse(savedCollection);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompanies(parsed);
          const savedActive = localStorage.getItem(`${userKey}_active_company_id`);
          if (savedActive && parsed.some((c: CompanyCoverLetter) => c.id === savedActive)) {
            setActiveCompanyId(savedActive);
          } else {
            setActiveCompanyId(parsed[0].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [userKey]);

  // Current Active Company
  const currentCompany: CompanyCoverLetter = companies.find(c => c.id === activeCompanyId) || companies[0] || {
    id: 'fallback',
    companyName: '기본 지원',
    sections: DEFAULT_SECTIONS,
    answers: {},
    updatedAt: ''
  };

  const sections = currentCompany.sections || DEFAULT_SECTIONS;
  const answers = currentCompany.answers || {};

  const [savedTime, setSavedTime] = useState<string>(currentCompany.updatedAt || '');

  // Add Company Modal State (Defaults to false; open explicitly via Add Company button)
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState<boolean>(false);
  const [newCompanyNameInput, setNewCompanyNameInput] = useState<string>('');

  // Delete Company Modal State
  const [companyToDelete, setCompanyToDelete] = useState<CompanyCoverLetter | null>(null);

  // Reset to default sections confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // A4 Document Preview Modal State (A4 용지 세로 문서 미리보기 및 인쇄)
  const [isA4PreviewOpen, setIsA4PreviewOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

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

  // Deleting Section Confirmation Modal State
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; title: string } | null>(null);

  // Editing Section State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editChars, setEditChars] = useState<number>(500);

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

  // Persistent storage helper for companies
  const persistCompanies = (updated: CompanyCoverLetter[], targetActiveId?: string) => {
    try {
      localStorage.setItem(`${userKey}_company_letters`, JSON.stringify(updated));
      const activeIdToStore = targetActiveId || activeCompanyId;
      if (activeIdToStore) {
        localStorage.setItem(`${userKey}_active_company_id`, activeIdToStore);
      }
      const active = updated.find(c => c.id === activeIdToStore) || updated[0];
      if (active) {
        localStorage.setItem(userKey, JSON.stringify(active.answers));
        localStorage.setItem(`${userKey}_sections`, JSON.stringify(active.sections));
        localStorage.setItem(`${userKey}_target_company`, active.companyName);
      }
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  };

  // Save active company
  const handleSave = (silent: boolean = false) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setSavedTime(timeStr);

    const updated = companies.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          updatedAt: timeStr
        };
      }
      return c;
    });

    setCompanies(updated);
    persistCompanies(updated, activeCompanyId);

    if (!silent) {
      showToast(t(`💾 '${currentCompany.companyName}' 자기소개서가 안전하게 저장되었습니다!`), 'success');
    }
  };

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [companies, activeCompanyId]);

  // Section answer change
  const handleChange = (id: string, text: string) => {
    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          return {
            ...c,
            answers: {
              ...c.answers,
              [id]: text
            }
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
    });
  };

  // Company Name Change directly from Editor
  const handleUpdateCompanyName = (name: string) => {
    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          return {
            ...c,
            companyName: name
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
    });
  };

  // Switch Active Company
  const handleSelectCompany = (id: string) => {
    if (id === activeCompanyId) return;
    setActiveCompanyId(id);
    const targetComp = companies.find(c => c.id === id);
    if (targetComp) {
      setSavedTime(targetComp.updatedAt || '');
      showToast(t(`🏢 '${targetComp.companyName}' 자기소개서를 불러왔습니다.`), 'info');
    }
  };

  // Create New Company
  const handleCreateNewCompany = (nameToUse?: string) => {
    const rawName = (typeof nameToUse === 'string' ? nameToUse : newCompanyNameInput).trim();
    if (!rawName) {
      showToast(t('지원할 기업명을 입력해주세요!'), 'warn');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `comp_${Date.now()}`;
    const newComp: CompanyCoverLetter = {
      id: newId,
      companyName: rawName,
      sections: DEFAULT_SECTIONS.map((s, idx) => ({
        ...s,
        id: `${s.id}_${Date.now()}_${idx}`,
        title: `${idx + 1}. ${getCleanTitle(s.title)}`
      })),
      answers: {},
      updatedAt: timeStr
    };

    const updated = [newComp, ...companies.filter(c => c.id !== newId)];
    setCompanies(updated);
    setActiveCompanyId(newId);
    setSavedTime(timeStr);
    setNewCompanyNameInput('');
    setIsAddCompanyModalOpen(false);
    persistCompanies(updated, newId);
    showToast(t(`🏢 '${rawName}' 새로운 자기소개서 작성을 시작합니다!`), 'success');
  };

  // Confirm delete company
  const confirmDeleteCompany = () => {
    if (!companyToDelete) return;
    if (companies.length <= 1) {
      showToast(t('최소 1개 이상의 자기소개서는 유지되어야 합니다.'), 'warn');
      setCompanyToDelete(null);
      return;
    }

    const filtered = companies.filter(c => c.id !== companyToDelete.id);
    let nextActiveId = activeCompanyId;
    if (activeCompanyId === companyToDelete.id) {
      nextActiveId = filtered[0].id;
    }

    setCompanies(filtered);
    setActiveCompanyId(nextActiveId);
    persistCompanies(filtered, nextActiveId);
    setCompanyToDelete(null);
    showToast(t(`'${companyToDelete.companyName}' 자기소개서가 삭제되었습니다.`), 'info');
  };

  // Add Custom Section to active company
  const handleAddCustomSection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      showToast(t('질문(문항 내용)을 입력해주세요!'), 'warn');
      return;
    }

    const cleanTitle = getCleanTitle(trimmed);
    const newId = `custom_${Date.now()}`;
    const newSec: CoverLetterSection = {
      id: newId,
      title: `${sections.length + 1}. ${cleanTitle}`,
      recommendedChars: Math.max(50, Number(newChars) || 500),
      placeholder: '해당 문항에 대한 내용을 구체적인 경험과 근거를 바탕으로 작성하세요.',
      isCustom: true
    };

    const updatedSections = [...sections, newSec];
    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          return {
            ...c,
            sections: updatedSections
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
    });

    // Reset create state
    setNewTitle('');
    setNewChars(500);
    setIsAddingSection(false);
    showToast(t('새 문항이 성공적으로 추가되었습니다!'), 'success');

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

  // Open modal to confirm deleting section
  const handleDeleteSection = (id: string, title: string) => {
    setSectionToDelete({ id, title });
  };

  // Execute section deletion when confirmed in modal (renumbers sequentially from 1)
  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;
    const { id } = sectionToDelete;
    const filtered = sections.filter(s => s.id !== id);
    // Renumber remaining sections sequentially so questions always start from 1
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      title: `${idx + 1}. ${getCleanTitle(s.title)}`
    }));

    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          const newAnswers = { ...c.answers };
          delete newAnswers[id];
          return {
            ...c,
            sections: renumbered,
            answers: newAnswers
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
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

    setSectionToDelete(null);
    showToast(t('문항이 삭제되었으며 번호가 순차적으로 재정렬되었습니다.'), 'info');
  };

  // Start editing a section title/recommendedChars
  const handleStartEdit = (sec: CoverLetterSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(getCleanTitle(sec.title));
    setEditChars(sec.recommendedChars);
  };

  // Save edited section
  const handleSaveEdit = (secId: string) => {
    const clean = getCleanTitle(editTitle);
    if (!clean) {
      showToast(t('질문 제목을 입력해주세요!'), 'warn');
      return;
    }
    const updatedSections = sections.map((s, idx) => {
      if (s.id === secId) {
        return {
          ...s,
          title: `${idx + 1}. ${clean}`,
          recommendedChars: Math.max(50, Number(editChars) || 500)
        };
      }
      return s;
    });

    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          return {
            ...c,
            sections: updatedSections
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
    });

    setEditingSectionId(null);
    showToast(t('문항 정보가 수정되었습니다.'), 'success');
  };

  // Confirm Reset to default 5 sections
  const confirmResetToDefault = () => {
    const resetSections = DEFAULT_SECTIONS.map((s, idx) => ({
      ...s,
      id: `${s.id}_${Date.now()}_${idx}`,
      title: `${idx + 1}. ${getCleanTitle(s.title)}`
    }));

    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === activeCompanyId) {
          return {
            ...c,
            sections: resetSections
          };
        }
        return c;
      });
      persistCompanies(updated);
      return updated;
    });

    setIsResetConfirmOpen(false);
    showToast(t('기본 5개 문항으로 안전하게 복원되었습니다!'), 'success');
  };

  // [오타 수정] 버튼: AI 및 국립국어원 표준 엔진으로 모든 오타와 띄어쓰기를 정확하게 자동 교정
  const handleAutoFixSpelling = async (sectionId: string) => {
    const originalText = answers[sectionId] || '';
    if (!originalText.trim()) {
      showToast(t('오타 수정을 진행할 텍스트를 먼저 입력해주세요!'), 'warn');
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

  // 고화질 PDF 파일 생성 및 다운로드
  const handleDownloadPdf = async () => {
    if (!currentCompany) return;

    if (!isA4PreviewOpen) {
      setIsA4PreviewOpen(true);
      showToast(t('A4 서식을 불러와 PDF 파일을 생성합니다...'), 'info');
      setTimeout(() => {
        generatePdfAction();
      }, 400);
      return;
    }

    await generatePdfAction();
  };

  const generatePdfAction = async () => {
    const element = document.getElementById('a4-print-document');
    if (!element) {
      showToast(t('문서 요소를 찾을 수 없습니다. 다시 시도해 주세요.'), 'warn');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      showToast(t('고화질 PDF 파일을 생성하고 있습니다. 잠시만 기다려주세요...'), 'info');

      // Ensure full rendering without clipped scroll
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = pdfWidth / imgWidth;
      const totalPdfHeight = imgHeight * ratio;

      let heightLeft = totalPdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - totalPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfHeight;
      }

      const safeCompany = (currentCompany.companyName || '자기소개서').replace(/[/\\?%*:|"<>]/g, '_').trim();
      const candidateName = (userProfile?.name || user?.displayName || '지원자').replace(/[/\\?%*:|"<>]/g, '_').trim();
      const fileName = `${safeCompany}_자기소개서_${candidateName}.pdf`;

      pdf.save(fileName);
      showToast(t(`📄 '${fileName}' PDF 파일이 성공적으로 저장되었습니다!`), 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast(t('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄 대화상자에서 PDF 저장을 이용해 주세요.'), 'warn');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 텍스트 파일 다운로드
  const handleDownloadText = () => {
    if (!currentCompany) return;
    let text = `==================================================\n`;
    text += `[ ${currentCompany.companyName} 자기소개서 ]\n`;
    text += `작성일시: ${new Date().toLocaleString('ko-KR')}\n`;
    text += `총 문항수: ${sections.length}개\n`;
    text += `총 글자수: ${totalChars}자 (공백제외 ${totalCharsNoSpace}자)\n`;
    text += `==================================================\n\n`;

    sections.forEach((sec, idx) => {
      text += `■ ${idx + 1}. ${getCleanTitle(sec.title)} (${sec.recommendedChars}자 권장)\n\n`;
      text += `${answers[sec.id] || '(작성된 내용이 없습니다.)'}\n\n`;
      text += `--------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = currentCompany.companyName.replace(/[/\\?%*:|"<>]/g, '_').trim() || '자기소개서';
    a.href = url;
    a.download = `자기소개서_${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t(`⬇️ '${currentCompany.companyName}' 텍스트 파일이 다운로드되었습니다!`), 'success');
  };

  // Total characters count across all sections for current company
  const totalChars = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
  const totalCharsNoSpace = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.replace(/\s/g, '').length : 0), 0);

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            toast.type === 'warn'
              ? isLightMode ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-amber-950/90 border-amber-600 text-amber-200"
              : toast.type === 'info'
                ? isLightMode ? "bg-sky-50 border-sky-300 text-sky-900" : "bg-sky-950/90 border-sky-600 text-sky-200"
                : isLightMode ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-900 border-emerald-500/60 text-emerald-300 shadow-emerald-500/10"
          }`}>
            {toast.type === 'warn' ? (
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
            ) : toast.type === 'info' ? (
              <Building2 size={16} className="text-sky-500 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/80 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-emerald-600' : 'text-white hover:text-emerald-400'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-1 sm:ml-2 shrink-0">
            {t('기업별 자기소개서')}
          </span>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setIsAddCompanyModalOpen(true);
              setNewCompanyNameInput('');
            }}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-xs transition-all cursor-pointer"
            title={t('새로운 기업 자기소개서 작성')}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{t('새 자소서 작성')}</span>
          </button>

          <Link
            to="/interview"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">{t('AI 모의면접')}</span>
          </Link>

          {savedTime && (
            <span className={`text-[11px] hidden sm:flex items-center gap-1 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock size={12} />
              <span>{savedTime} {t('저장됨')}</span>
            </span>
          )}

          {/* A4 Document Preview Button (Right next to Save) */}
          <button
            type="button"
            onClick={() => setIsA4PreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer"
            title={t('A4 한글/문서 서식 미리보기 및 인쇄')}
          >
            <FileText size={14} />
            <span>{t('A4 미리보기')}</span>
          </button>

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
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* ============================================================== */}
        {/* UNIFIED COMPANY & ACTION COMMAND BAR (통합 지원 기업 및 툴바) */}
        {/* ============================================================== */}
        <div className={`rounded-2xl border mb-6 transition-all shadow-xs overflow-hidden tour-target-cover-companies ${
          isLightMode ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
        }`}>
          {/* Top row: Company Switcher Tabs + Document Actions */}
          <div className={`px-4 sm:px-5 py-2.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isLightMode ? "bg-slate-50/80 border-slate-200" : "bg-slate-800/40 border-slate-800"
          }`}>
            {/* Company Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline shrink-0">
                {t('지원 기업')}:
              </span>
              {companies.map(comp => {
                const isActive = comp.id === activeCompanyId;
                const answeredCount = comp.sections.filter(s => !!(comp.answers[s.id] || '').trim()).length;
                const totalSecCount = comp.sections.length;

                return (
                  <div
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp.id)}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? isLightMode
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-emerald-500 text-slate-950 font-black border-emerald-500 shadow-xs"
                        : isLightMode
                          ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-emerald-300"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                  >
                    <Building2 size={13} className={isActive ? (isLightMode ? "text-white" : "text-slate-950") : "text-emerald-500"} />
                    <span className="truncate max-w-[130px]">{comp.companyName || t('지원 기업')}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? isLightMode ? "bg-white/20 text-white" : "bg-slate-950/20 text-slate-950"
                        : isLightMode ? "bg-slate-100 text-slate-600" : "bg-slate-700 text-slate-300"
                    }`}>
                      {answeredCount}/{totalSecCount}
                    </span>

                    {companies.length > 1 && (
                      <button
                        type="button"
                        title={t('이 기업 자기소개서 삭제')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompanyToDelete(comp);
                        }}
                        className={`p-0.5 rounded transition-colors ml-0.5 ${
                          isActive
                            ? isLightMode ? "text-white/70 hover:text-white hover:bg-white/20" : "text-slate-950/60 hover:text-slate-950"
                            : "text-slate-400 hover:text-rose-500"
                        }`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsAddCompanyModalOpen(true);
                  setNewCompanyNameInput('');
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isLightMode
                    ? "border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100"
                    : "border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40"
                }`}
                title={t('새 기업 자기소개서 추가')}
              >
                <Plus size={13} />
                <span>{t('기업 추가')}</span>
              </button>
            </div>

            {/* Quick Action Toolbar (인쇄 미리보기, PDF 저장, 텍스트 다운로드, 초기화) */}
            <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsA4PreviewOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLightMode
                    ? "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700"
                    : "bg-sky-950/40 hover:bg-sky-900/60 border-sky-800 text-sky-300"
                }`}
                title={t('A4 서식 미리보기 및 인쇄')}
              >
                <Printer size={13} />
                <span>{t('A4 인쇄')}</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLightMode
                    ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                    : "bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800 text-emerald-300"
                }`}
                title={t('A4 서식 규격 PDF 파일로 즉시 저장')}
              >
                <Download size={13} />
                <span>{isGeneratingPdf ? t('생성 중...') : t('PDF 저장')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadText}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLightMode ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
                title={t('텍스트 파일(.txt)로 저장')}
              >
                <FileText size={13} />
                <span className="hidden sm:inline">{t('텍스트')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLightMode ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-500" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                }`}
                title={t('기본 5개 질문으로 복원')}
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">{t('복원')}</span>
              </button>
            </div>
          </div>

          {/* Bottom row: Inline Company Name Title & Stats */}
          <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-400 shrink-0">
                {t('현재 지원 기업')}:
              </span>
              <input
                type="text"
                value={currentCompany.companyName}
                onChange={e => handleUpdateCompanyName(e.target.value)}
                placeholder={t('기업명을 입력하세요 (예: 삼성전자, 한국항공우주산업)')}
                className={`font-black text-base sm:text-lg border-b border-transparent hover:border-slate-300 focus:border-emerald-500 px-1 py-0.5 outline-none transition-all flex-1 max-w-[340px] bg-transparent ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              />
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                isLightMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              }`}>
                {sections.length}{t('개 문항')}
              </span>
            </div>

            {/* Total characters stat badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold self-start sm:self-auto shrink-0 ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}>
              <span className="text-slate-400 font-normal">{t('총 글자수')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{totalChars}자</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-400 font-normal">{t('공백제외')}:</span>
              <span>{totalCharsNoSpace}자</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. COVER LETTER QUESTIONS & ANSWER BOXES (해당 기업 문항 리스트) */}
        {/* ============================================================== */}
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
                className={`rounded-2xl border transition-all scroll-mt-24 shadow-xs overflow-hidden ${
                  isLightMode 
                    ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-100" 
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs"
                }`}
              >
                {/* Header: Sequential Question Title + Right Action Buttons */}
                <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLightMode ? "border-slate-100 bg-slate-50/60" : "border-slate-800/80 bg-slate-800/30"
                }`}>
                  {/* Left: Question title & recommended chars */}
                  {isEditingThis ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-0.5">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          placeholder={t('질문 제목을 입력하세요')}
                          className={`flex-1 border rounded-lg px-3 py-1.5 text-sm font-bold outline-none ${
                            isLightMode ? "bg-white border-emerald-500 text-slate-900" : "bg-slate-800 border-emerald-500 text-white"
                          }`}
                        />
                      </div>
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
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                          {index + 1}
                        </span>
                        <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>
                          {getCleanTitle(sec.title)}
                        </h2>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        isLightMode ? "bg-white border-slate-200 text-slate-600 shadow-2xs" : "bg-slate-800 border-slate-700 text-slate-300"
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

                  {/* Right Header Buttons: [내 경험], [문항 수정], [문항 삭제] */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* [내 경험] 토글 버튼 및 팝업 창 */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenExperiences(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                        className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs tour-target-cover-my-exp ${
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
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isExperienceOpen 
                            ? (isLightMode ? "bg-white/20 text-white" : "bg-slate-950/20 text-slate-950")
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {diaries.length}
                        </span>
                      </button>

                      {/* 내 경험 팝업 창 */}
                      {isExperienceOpen && (
                        <div className={`absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-30 animate-in fade-in zoom-in-95 duration-150 ${
                          isLightMode 
                            ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/10" 
                            : "bg-slate-900 border-emerald-500/40 text-white shadow-black/60"
                        }`}>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <BookOpen size={14} className="text-emerald-500" />
                              <span className="text-xs font-bold">{t('성장 다이어리 실습 경험')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOpenExperiences(prev => ({ ...prev, [sec.id]: false }))}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {diaries.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                              <p>{t('아직 기록된 성장 다이어리가 없습니다.')}</p>
                              <Link 
                                to="/diary" 
                                className="inline-block mt-2 text-emerald-500 font-bold hover:underline"
                              >
                                {t('성장 다이어리 작성하러 가기 →')}
                              </Link>
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
                              {diaries.map(d => (
                                <div 
                                  key={d.id}
                                  className={`p-2.5 rounded-xl border transition-all ${
                                    isLightMode 
                                      ? "bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300" 
                                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                      {d.mood || '📝'} {d.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{d.date}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                                    {d.content}
                                  </p>
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedDiary(d);
                                        setActiveDiarySectionId(sec.id);
                                      }}
                                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                      <span>{t('자세히 보기 & 인용')}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInsertDiary(sec.id, d)}
                                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-2xs"
                                    >
                                      {t('+ 바로 넣기')}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sec)}
                        className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isLightMode 
                            ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-100" 
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                        title={t('질문 제목 및 권장 글자수 변경')}
                      >
                        <Edit3 size={12} />
                        <span>{t('수정')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id, sec.title)}
                      className={`text-xs font-bold flex items-center justify-center w-7 h-7 rounded-xl border transition-all cursor-pointer ${
                        isLightMode 
                          ? "bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 border-slate-200" 
                          : "bg-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/40 border-slate-700"
                      }`}
                      title={t('이 문항을 자기소개서에서 완전히 삭제')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Spell Check Notification Banner with Undo */}
                {notif && (
                  <div className={`px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between border-b animate-in fade-in duration-200 ${
                    notif.includes('오류가 발견되지 않았습니다')
                      ? isLightMode ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-amber-950/40 border-amber-800 text-amber-300"
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

                {/* Focused Writing Canvas */}
                <div className="p-4 sm:p-5">
                  <div className={`rounded-xl border transition-all overflow-hidden focus-within:ring-2 focus-within:border-emerald-500 ${
                    isLightMode 
                      ? "bg-slate-50/50 border-slate-200 focus-within:bg-white focus-within:ring-emerald-500/20" 
                      : "bg-slate-800/40 border-slate-700 focus-within:bg-slate-800/80 focus-within:ring-emerald-500/30"
                  }`}>
                    <textarea
                      rows={7}
                      value={currentVal}
                      onChange={e => handleChange(sec.id, e.target.value)}
                      placeholder={sec.placeholder}
                      className={`w-full p-4 text-sm sm:text-base font-normal outline-none leading-relaxed transition-colors resize-y bg-transparent ${
                        isLightMode ? "text-slate-900 placeholder-slate-400" : "text-slate-100 placeholder-slate-500"
                      }`}
                    />

                    {/* Integrated Editor Toolbar & Character Stats Footer */}
                    <div className={`px-4 py-2.5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs ${
                      isLightMode ? "bg-white/80 border-slate-200" : "bg-slate-900/60 border-slate-700"
                    }`}>
                      {/* Left: Live Character Count & Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-sm ${
                            charCount > 0 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : isLightMode ? "text-slate-400" : "text-slate-500"
                          }`}>
                            {charCount}자
                          </span>
                          <span className="text-slate-400 font-medium">
                            / {sec.recommendedChars}자
                          </span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            charCount >= sec.recommendedChars * 0.8
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {Math.round((charCount / sec.recommendedChars) * 100)}%
                          </span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {t('공백제외')} {charCountNoSpace}자
                        </span>
                      </div>

                      {/* Right: Spell Check Button & Status */}
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        {charCount > sec.recommendedChars + 100 && (
                          <span className="text-rose-500 font-bold text-[11px] mr-1">
                            {t('⚠️ 권장 분량 초과')}
                          </span>
                        )}

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
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 active:scale-95 shadow-xs"
                                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-emerald-500 active:scale-95 shadow-xs"
                          }`}
                          title={t('이 문항의 모든 오타와 맞춤법을 즉시 자동 교정합니다')}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state when all sections deleted */}
        {sections.length === 0 && (
          <div className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-3 ${
            isLightMode ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"
          }`}>
            <p className="text-sm font-semibold text-slate-500">{t('작성 중인 자기소개서 문항이 없습니다.')}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSection(true);
                  setNewTitle('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {t('질문 추가하기')}
              </button>
              <button
                type="button"
                onClick={confirmResetToDefault}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  isLightMode ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {t('기본 문항 불러오기')}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. ADD QUESTION SECTION (자기소개서 질문 추가) */}
        {/* ============================================================== */}
        <div className="mt-8">
          {!isAddingSection ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSection(true);
                  setNewTitle('');
                }}
                className={`flex-1 w-full py-3.5 px-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2.5 font-bold transition-all cursor-pointer group shadow-2xs hover:scale-[1.005] active:scale-[0.995] ${
                  isLightMode
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500"
                    : "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400"
                }`}
              >
                <Plus size={18} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-black">{t('자기소개서 질문 추가')}</span>
              </button>

              {/* 기본 문항과 다른 경우 복원 버튼 제공 */}
              {(sections.length !== DEFAULT_SECTIONS.length || sections.some(s => s.isCustom)) && (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className={`px-4 py-3.5 rounded-2xl border text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    isLightMode 
                      ? "border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:bg-slate-50" 
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                  }`}
                  title={t('기본 5개 문항으로 되돌리기')}
                >
                  {t('기본 문항 복원')}
                </button>
              )}
            </div>
          ) : (
            <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isLightMode 
                ? "bg-white border-emerald-500/90 shadow-emerald-500/5" 
                : "bg-slate-900 border-emerald-500/70 shadow-black/50"
            }`}>
              {/* Creator Box Header (간결한 상단바) */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Plus size={16} />
                  </div>
                  <h3 className={`text-base font-black ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    {t('자기소개서 질문 추가')}
                  </h3>
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

              {/* Input Form Fields */}
              <form onSubmit={handleAddCustomSection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('질문 (문항 제목)')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-500/20 shrink-0">
                        {sections.length + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder={t('예: 지원동기 및 입사 후 포부')}
                        className={`flex-1 w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors ${
                          isLightMode 
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                            : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('권장 글자수')} <span className="text-rose-500">*</span>
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
                        className={`w-full border rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold outline-none transition-colors ${
                          isLightMode 
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                            : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        자
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Chars recommendations */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">{t('추천 글자수')}:</span>
                  {[400, 500, 600, 700, 800, 1000].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNewChars(cnt)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        newChars === cnt
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : isLightMode 
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600" 
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                    >
                      {cnt}자
                    </button>
                  ))}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSection(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isLightMode 
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-600" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-400"
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
            <span>{t('작성 중인 내용은 브라우저에 실시간 자동 보관됩니다.')}</span>
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

      {/* ============================================================== */}
      {/* 5. MODALS & POPUPS */}
      {/* ============================================================== */}

      {/* A. NEW COMPANY CREATION MODAL */}
      {isAddCompanyModalOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"
        }`}>
          <div className={`border-2 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto ${
            isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-emerald-500/50 text-white"
          }`}>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {t('새로운 자기소개서 작성')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('지원할 회사 이름을 입력하고 새 자기소개서를 시작하세요.')}
                  </p>
                </div>
              </div>
              {companies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t('닫기')}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleCreateNewCompany(); }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5 flex items-center gap-1">
                  <span>{t('지원할 회사 이름')}</span>
                  <span className="text-rose-500 font-black">*</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                    ({t('새 양식으로 작성 시작')})
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newCompanyNameInput}
                    onChange={e => setNewCompanyNameInput(e.target.value)}
                    placeholder={t('예: 삼성전자, 현대자동차, 한국전력공사 등')}
                    className={`w-full border-2 rounded-2xl pl-4 pr-10 py-3 text-sm sm:text-base font-bold outline-none transition-all ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                        : "bg-slate-800 border-slate-700 text-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                    }`}
                  />
                  {newCompanyNameInput && (
                    <button
                      type="button"
                      onClick={() => setNewCompanyNameInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Popular Company Presets */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-500" />
                  <span>{t('추천 인기 기업 선택')}:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COMPANIES.map(comp => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setNewCompanyNameInput(comp)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        newCompanyNameInput === comp
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs scale-105"
                          : isLightMode 
                            ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-emerald-400" 
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:border-emerald-400/60"
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Writing Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{t('이 회사로 새 자기소개서 작성 시작')}</span>
              </button>
            </form>

            {/* Previously Created Cover Letters List (지금까지 작성한 자소서가 있을 경우) */}
            {companies.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 size={13} className="text-emerald-500" />
                    <span>{t('📂 지금까지 작성한 자기소개서')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">({companies.length}개)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{t('클릭 시 즉시 열기')}</span>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {companies.map(comp => {
                    const answeredCount = comp.sections.filter(s => !!(comp.answers[s.id] || '').trim()).length;
                    const isCurrent = comp.id === activeCompanyId;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          handleSelectCompany(comp.id);
                          setIsAddCompanyModalOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? isLightMode
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold"
                            : isLightMode
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                              : "bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Building size={14} className={isCurrent ? "text-emerald-600 dark:text-emerald-400 shrink-0" : "text-slate-400 shrink-0"} />
                          <span className="text-xs truncate">{comp.companyName}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">
                              {t('현재 선택')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0 ml-2">
                          <span className="font-semibold">{answeredCount}/{comp.sections.length}문항</span>
                          {comp.updatedAt && <span>· {comp.updatedAt}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddCompanyModalOpen(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {t('✕ 기존 작업 계속하기')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. DELETE COMPANY CONFIRMATION MODAL */}
      {companyToDelete && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"
        }`}>
          <div className={`border-2 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLightMode ? "bg-white border-slate-200" : "bg-slate-900 border-rose-500/50 text-white"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('기업 자기소개서 삭제')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('해당 기업의 작성 내용이 모두 삭제됩니다.')}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold mb-5 ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}>
              <span className="text-slate-400 block text-[10px] mb-0.5">{t('삭제 대상')}:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                🏢 {companyToDelete.companyName}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {t('취소')}
              </button>
              <button
                type="button"
                onClick={confirmDeleteCompany}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                {t('삭제하기')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. RESET SECTIONS TO DEFAULT CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"
        }`}>
          <div className={`border-2 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLightMode ? "bg-white border-slate-200" : "bg-slate-900 border-emerald-500/50 text-white"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('기본 문항으로 복원')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('기본 5개 질문으로 초기화됩니다.')}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs leading-relaxed mb-5 ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}>
              <span className="font-semibold block mb-1 text-slate-900 dark:text-white">
                {t('성장과정, 자기소개, 장점, 단점, 실습경험')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('기본 5개 문항으로 복원하며 직접 추가했던 문항은 초기화됩니다. 계속하시겠습니까?')}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {t('취소')}
              </button>
              <button
                type="button"
                onClick={confirmResetToDefault}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                {t('복원하기')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. SECTION DELETION CONFIRMATION MODAL */}
      {sectionToDelete && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? "bg-slate-900/40" : "bg-slate-950/80"
        }`}>
          <div className={`border-2 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLightMode ? "bg-white border-slate-200" : "bg-slate-900 border-rose-500/50 text-white"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('정말로 삭제하겠습니까?')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('문항과 작성된 답변이 함께 삭제됩니다.')}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold mb-5 ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}>
              <span className="text-slate-400 block text-[10px] mb-0.5">{t('삭제할 질문')}:</span>
              <span className="font-bold text-slate-900 dark:text-white line-clamp-2">
                {getCleanTitle(sectionToDelete.title)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {t('취소')}
              </button>
              <button
                type="button"
                onClick={confirmDeleteSection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                {t('삭제하기')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. DIARY DETAIL & INSERT MODAL */}
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

      {/* ============================================================== */}
      {/* F. A4 DOCUMENT PREVIEW & PRINT MODAL (한글/A4 서식 미리보기) */}
      {/* ============================================================== */}
      {isA4PreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-6 print:p-0 print:bg-white print:static animate-in fade-in duration-150">
          
          {/* Print Style Injector */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 15mm 12mm 15mm;
              }
              html, body {
                background: white !important;
                color: black !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #a4-print-document, #a4-print-document * {
                visibility: visible !important;
              }
              #a4-print-document {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10mm 15mm !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Sticky Top Control Toolbar (Hidden in Print) */}
          <div className="no-print sticky top-3 z-50 w-full max-w-[840px] mb-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black flex items-center gap-1.5">
                  <span>[{currentCompany.companyName}]</span>
                  <span>{t('A4 자기소개서 서식')}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t('실제 한글(HWP)/입사지원서 서식 규격에 맞춘 A4 세로 인쇄 및 PDF 저장')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Real Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                title={t('프린터로 직접 인쇄하거나 브라우저 인쇄 대화상자 열기')}
              >
                <Printer size={15} />
                <span>{t('인쇄하기')}</span>
              </button>

              {/* Real PDF File Download Button */}
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title={t('A4 서식 규격 PDF 파일(.pdf)로 즉시 다운로드')}
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{t('PDF 생성 중...')}</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>{t('PDF 파일 저장')}</span>
                  </>
                )}
              </button>

              {/* Download TXT Button */}
              <button
                type="button"
                onClick={handleDownloadText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-all cursor-pointer"
                title={t('텍스트 파일로 다운로드')}
              >
                <FileText size={13} />
                <span className="hidden sm:inline">{t('텍스트 저장')}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsA4PreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
                title={t('닫기 및 편집으로 돌아가기')}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Authentic Vertical A4 Paper Canvas */}
          <div 
            id="a4-print-document" 
            className="w-full max-w-[820px] min-h-[1160px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-14 border border-slate-200/90 my-2 sm:my-4 transition-all relative font-sans flex flex-col justify-between"
            style={{ minHeight: '297mm' }}
          >
            {/* Top Document Header Section */}
            <div>
              {/* Document Meta Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 mb-4 border-b border-slate-300">
                <span className="font-semibold tracking-wider">[ 2026학년도 입사지원서 서식 ]</span>
                <span>MyStair 표준 취업 자기소개서 양식</span>
              </div>

              {/* Main Official Title */}
              <div className="text-center py-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-slate-950 mb-1">
                  [ {currentCompany.companyName} ] 입 사 지 원 서
                </h1>
                <p className="text-sm font-bold text-slate-600 tracking-wider">
                  ( 자 기 소 개 서 )
                </p>
              </div>

              {/* Applicant Summary Formal Table */}
              <div className="border border-slate-800 rounded-xs mb-8 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="w-24 bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        지 원 기 업
                      </td>
                      <td className="p-2.5 font-extrabold text-slate-900 border-r border-slate-300">
                        {currentCompany.companyName}
                      </td>
                      <td className="w-24 bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        지 원 자
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {userProfile?.name || user?.displayName || '지원자'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        소 속 학 교
                      </td>
                      <td className="p-2.5 text-slate-800 border-r border-slate-300">
                        {userProfile?.highSchool || '마이스터고등학교'} {userProfile?.major ? `(${userProfile.major})` : ''}
                      </td>
                      <td className="bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        작 성 일 자
                      </td>
                      <td className="p-2.5 text-slate-800">
                        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        문 항 구 성
                      </td>
                      <td className="p-2.5 text-slate-800 border-r border-slate-300">
                        총 <strong className="text-slate-950 font-bold">{sections.length}</strong>개 항목
                      </td>
                      <td className="bg-slate-100 font-bold p-2.5 text-center text-slate-800 border-r border-slate-300">
                        총 분 량
                      </td>
                      <td className="p-2.5 text-slate-800">
                        <strong className="text-slate-950 font-bold">{totalChars}자</strong> (공백 제외 {totalCharsNoSpace}자)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Double Horizontal Separator Line */}
              <div className="border-b-4 border-double border-slate-900 mb-8"></div>

              {/* Questions & Answers Sequentially Formatted */}
              <div className="space-y-8">
                {sections.map((sec, idx) => {
                  const content = (answers[sec.id] || '').trim();
                  const charCount = content.length;
                  return (
                    <div key={sec.id} className="break-inside-avoid">
                      {/* Question Header Box */}
                      <div className="bg-slate-100/90 border-l-4 border-slate-900 px-3.5 py-2 mb-3.5 flex items-center justify-between text-slate-900">
                        <h2 className="font-extrabold text-[15px] sm:text-[16px] tracking-tight">
                          {idx + 1}. {getCleanTitle(sec.title)}
                        </h2>
                        <span className="text-[11px] text-slate-500 font-semibold shrink-0 ml-2">
                          [ 권장 {sec.recommendedChars}자 | 실제 {charCount}자 ]
                        </span>
                      </div>

                      {/* Answer Body */}
                      {content ? (
                        <div className="whitespace-pre-wrap leading-[1.85] text-[14px] sm:text-[14.5px] text-slate-900 font-normal tracking-[-0.015em] pl-1 break-words">
                          {content}
                        </div>
                      ) : (
                        <div className="italic text-slate-400 text-xs sm:text-sm pl-1 py-4 border-b border-dashed border-slate-200">
                          (작성된 내용이 없습니다.)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formal Footer & Signature Block */}
            <div className="border-t-2 border-slate-300 pt-8 mt-12 text-center break-inside-avoid">
              <p className="text-sm font-semibold text-slate-800 tracking-tight mb-3">
                위 기재 사항은 사실과 틀림없음을 서약하며, 만일 허위 사실이 있을 경우 어떠한 불이익도 감수하겠습니다.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mb-8">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="flex items-center justify-end pr-6 text-sm font-bold text-slate-900 gap-2">
                <span>지 원 자 : </span>
                <span className="inline-block border-b border-slate-400 min-w-[120px] text-center pb-0.5">
                  {userProfile?.name || user?.displayName || '지원자'}
                </span>
                <span className="font-normal text-slate-500 text-xs">(인 / 서명)</span>
              </div>

              {/* Page Number indicator */}
              <div className="text-center text-xs text-slate-400 mt-10">
                - 1 -
              </div>
            </div>
          </div>

          {/* Bottom Floating Close Button (Mobile Friendly) */}
          <div className="no-print mt-4 pb-8 flex justify-center">
            <button
              type="button"
              onClick={() => setIsA4PreviewOpen(false)}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-200 shadow-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <X size={14} />
              <span>{t('A4 미리보기 닫기 (편집으로)')}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
