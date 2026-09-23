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

  // Add Company Modal State
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState<boolean>(false);
  const [newCompanyNameInput, setNewCompanyNameInput] = useState<string>('');

  // Delete Company Modal State
  const [companyToDelete, setCompanyToDelete] = useState<CompanyCoverLetter | null>(null);

  // Reset to default sections confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

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

    const updated = [...companies, newComp];
    setCompanies(updated);
    setActiveCompanyId(newId);
    setSavedTime(timeStr);
    setNewCompanyNameInput('');
    setIsAddCompanyModalOpen(false);
    persistCompanies(updated, newId);
    showToast(t(`🏢 '${rawName}' 자기소개서 컬렉션이 생성되었습니다!`), 'success');
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

  // 전체 복사
  const handleCopyAll = () => {
    if (!currentCompany) return;
    let text = `[ ${currentCompany.companyName} 자기소개서 ]\n\n`;
    sections.forEach((sec, idx) => {
      text += `■ ${idx + 1}. ${getCleanTitle(sec.title)} (${sec.recommendedChars}자 권장)\n`;
      text += `${answers[sec.id] || '(작성 내용 없음)'}\n\n`;
    });
    navigator.clipboard.writeText(text.trim());
    showToast(t(`📋 '${currentCompany.companyName}' 전체 자기소개서 내용이 클립보드에 복사되었습니다!`), 'success');
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
              <span>{savedTime} {t('저장됨')}</span>
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
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* ============================================================== */}
        {/* 1. COMPANY COVER LETTER COLLECTION BAR (기업별 자기소개서 컬렉션) */}
        {/* ============================================================== */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900/90 border-slate-800"
        }`}>
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Building size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base sm:text-lg font-black ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    {t('내 지원 기업 컬렉션')}
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {companies.length}{t('개 기업')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('기업별로 질문 문항과 자소서를 개별 관리하세요. 클릭하여 해당 기업 자서소로 즉시 전환됩니다.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddCompanyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>{t('새 기업 추가')}</span>
            </button>
          </div>

          {/* Horizontal Company Tab Chips List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
            {companies.map(comp => {
              const isActive = comp.id === activeCompanyId;
              const answeredCount = comp.sections.filter(s => !!(comp.answers[s.id] || '').trim()).length;
              const totalSecCount = comp.sections.length;
              const isCompleted = totalSecCount > 0 && answeredCount === totalSecCount;

              return (
                <div
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp.id)}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? isLightMode
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-emerald-500 text-slate-950 font-black border-emerald-500 shadow-sm"
                      : isLightMode
                        ? "bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50"
                  }`}
                >
                  <Building2 size={13} className={isActive ? (isLightMode ? "text-white" : "text-slate-950") : "text-emerald-500"} />
                  <span className="truncate max-w-[140px]">{comp.companyName || t('지원 기업')}</span>
                  
                  {/* Progress tag */}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? isLightMode
                        ? "bg-white/20 text-white"
                        : "bg-slate-950/20 text-slate-950 font-bold"
                      : isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isLightMode ? "bg-slate-200 text-slate-600" : "bg-slate-700 text-slate-300"
                  }`}>
                    {answeredCount}/{totalSecCount}
                  </span>

                  {/* Delete company button (only when more than 1 company exists) */}
                  {companies.length > 1 && (
                    <button
                      type="button"
                      title={t('이 기업 자기소개서 삭제')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompanyToDelete(comp);
                      }}
                      className={`p-0.5 rounded-md transition-colors cursor-pointer ml-1 ${
                        isActive
                          ? isLightMode
                            ? "text-white/70 hover:text-white hover:bg-white/20"
                            : "text-slate-950/60 hover:text-slate-950 hover:bg-black/10"
                          : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      }`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Quick '+' button at the end of tabs */}
            <button
              type="button"
              onClick={() => setIsAddCompanyModalOpen(true)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isLightMode 
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-500" 
                  : "border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-400"
              }`}
              title={t('새 기업 자기소개서 추가')}
            >
              <Plus size={14} />
              <span>{t('기업 추가')}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. ACTIVE COMPANY EDITOR HEADER (현재 지원 기업 정보 & 통계 & 액션) */}
        {/* ============================================================== */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900/90 border-slate-800"
        }`}>
          {/* Top Bar: Company Name Input Field + Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Direct Company Name Editor */}
            <div className="flex-1 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Building size={18} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  {t('현재 작성 중인 지원 기업명')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentCompany.companyName}
                    onChange={e => handleUpdateCompanyName(e.target.value)}
                    placeholder={t('기업명을 입력하세요 (예: 삼성전자, 현대자동차)')}
                    className={`flex-1 max-w-[420px] font-black text-lg sm:text-xl border rounded-xl px-3 py-1.5 outline-none transition-all ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                        : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                    }`}
                  />
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                    isLightMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                  }`}>
                    {sections.length}{t('개 문항')}
                  </span>
                </div>
              </div>
            </div>

            {/* Total characters badge */}
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 text-xs font-bold ${
              isLightMode ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}>
              <span className="text-[11px] text-slate-400 font-normal">{t('총 글자수')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{totalChars}자</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-[11px] text-slate-400 font-normal">{t('공백제외')}:</span>
              <span>{totalCharsNoSpace}자</span>
            </div>
          </div>

          {/* Quick Utility Action Bar: Copy All, Download TXT, Save, Delete Company */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyAll}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  isLightMode ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
                title={t('이 기업의 모든 자기소개서 문항과 내용을 클립보드에 복사')}
              >
                <Copy size={13} />
                <span>{t('전체 복사')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadText}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  isLightMode ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
                title={t('텍스트 파일(.txt)로 저장')}
              >
                <Download size={13} />
                <span>{t('텍스트 다운로드')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  isLightMode ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                }`}
                title={t('기본 5개 질문으로 문항 초기화')}
              >
                <RotateCcw size={12} />
                <span>{t('기본 문항 복원')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {companies.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCompanyToDelete(currentCompany)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                  title={t('현재 선택된 기업의 자기소개서를 컬렉션에서 삭제')}
                >
                  <Trash2 size={13} />
                  <span>{t('이 기업 삭제')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <Save size={13} />
                <span>{t('저장하기')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. COVER LETTER QUESTIONS & ANSWER BOXES (해당 기업 문항 리스트) */}
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
                className={`rounded-2xl border transition-all scroll-mt-24 ${
                  isLightMode 
                    ? "bg-white border-slate-200 shadow-xs hover:border-slate-300" 
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs"
                }`}
              >
                {/* Header: Sequential Question Title + Right Controls ([내 경험], [수정], [삭제]) */}
                <div className={`px-4 sm:px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLightMode ? "border-slate-100 bg-slate-50/50 rounded-t-2xl" : "border-slate-800/80 bg-slate-800/30 rounded-t-2xl"
                }`}>
                  {/* Title & Recommended Chars or Inline Edit Mode */}
                  {isEditingThis ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-1">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base font-extrabold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        {index + 1}. {getCleanTitle(sec.title)}
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

                  {/* Right Header Buttons: [내 경험], [수정], [문항 삭제] */}
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

                    {/* [문항 수정] 버튼 */}
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sec)}
                        className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isLightMode 
                            ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50" 
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                        title={t('질문 제목 및 권장 글자수 변경')}
                      >
                        <Edit3 size={12} />
                        <span>{t('수정')}</span>
                      </button>
                    )}

                    {/* [문항 삭제] (X) 버튼 */}
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
                  <div className={`px-4 sm:px-5 py-2.5 text-xs flex items-center justify-between border-b animate-in fade-in duration-200 ${
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
          <div className={`border-2 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150 ${
            isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-emerald-500/50 text-white"
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Building size={16} />
                </div>
                <h3 className="text-base font-black">
                  {t('새 기업 자기소개서 추가')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCompanyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleCreateNewCompany(); }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('지원 기업명')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newCompanyNameInput}
                  onChange={e => setNewCompanyNameInput(e.target.value)}
                  placeholder={t('예: 현대자동차, SK하이닉스, 한국전력공사 등')}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors ${
                    isLightMode 
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                      : "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  }`}
                />
              </div>

              {/* Popular Company Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {t('자주 지원하는 추천 기업 선택')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COMPANIES.map(comp => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setNewCompanyNameInput(comp)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        newCompanyNameInput === comp
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                          : isLightMode 
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-emerald-300" 
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:border-emerald-500/50"
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                  }`}
                >
                  {t('취소')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>{t('기업 추가하고 작성하기')}</span>
                </button>
              </div>
            </form>
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

    </div>
  );
}
