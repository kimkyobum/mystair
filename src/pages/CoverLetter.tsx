import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  Trash2, 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle, 
  RefreshCw,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  Building,
  Target,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface CoverLetterSection {
  id: string;
  title: string;
  subtitle: string;
  recommendedChars: number;
  placeholder: string;
  tips: string[];
}

const DEFAULT_SECTIONS: CoverLetterSection[] = [
  {
    id: 'intro',
    title: '1. 성장 과정 및 자기소개',
    subtitle: '나를 표현하는 한 문장과 고교 생활 중 마이스터/특성화인으로서 다져온 성장 스토리',
    recommendedChars: 500,
    placeholder: '자신의 핵심 가치관이나 성격, 학창 시절 실습 및 전공 탐색 과정에서 어떤 태도로 성장해왔는지 구체적인 계기와 함께 작성해보세요.',
    tips: [
      '단순히 "어릴 때부터 기계를 좋아했다"보다 실습 중 겪은 구체적인 계기를 서술하세요.',
      '책임감, 성실함, 끈기 등 나의 핵심 역량 키워드를 초반에 명확히 제시하세요.'
    ]
  },
  {
    id: 'strengths',
    title: '2. 성격의 장단점 및 특기',
    subtitle: '직무 수행에 도움이 되는 확실한 장점과, 단점을 보완하기 위해 실천 중인 노력',
    recommendedChars: 500,
    placeholder: '자신의 가장 큰 장점이 실무 현장이나 팀 프로젝트에서 어떻게 긍정적으로 발휘되었는지, 단점은 인정하고 어떤 루틴으로 극복하고 있는지 서술해보세요.',
    tips: [
      '장점은 프로젝트 협업이나 실습 상황의 실제 사례와 결합하여 신뢰도를 높이세요.',
      '단점은 극복 불가능한 치명적 단점 대신, 솔직히 인정하고 구체적인 극복 행동을 제시하세요.'
    ]
  },
  {
    id: 'competency',
    title: '3. 직무 전문성 및 프로젝트/실습 경험',
    subtitle: '전공 실습, 자격증 취득, 경진대회 및 문제 해결(Troubleshooting) 경험 (STAR 공법 추천)',
    recommendedChars: 700,
    placeholder: '다이어리에 기록해둔 실습 내용이나 자격증 실기 준비, 동아리 프로젝트에서 부딪힌 문제와 이를 해결하기 위해 내가 취한 행동(Action) 및 결과(Result)를 중심으로 적어보세요.',
    tips: [
      'STAR 공법(Situation 상황 - Task 과제 - Action 나의 행동 - Result 성과/배운 점)을 활용하면 논리적입니다.',
      '성장다이어리의 [자소서 요약] 버튼에서 추천받은 STAR 소재를 그대로 인용해보세요.'
    ]
  },
  {
    id: 'motive',
    title: '4. 지원동기 및 입사 후 포부',
    subtitle: '왜 이 회사여야 하는지, 그리고 입사 후 마이스터 기술인으로서 어떻게 기여할 것인지',
    recommendedChars: 600,
    placeholder: '희망하는 기업의 핵심 기술 분야나 사업 방향에 매력을 느낀 구체적인 이유와, 입사 1년차/3년차/5년차에 회사와 함께 어떤 전문가로 성장할 것인지 포부를 밝혀보세요.',
    tips: [
      '기업의 최근 뉴스, 주력 생산품, 기술 트렌드를 언급하여 관심도를 증명하세요.',
      '막연히 "열심히 배우겠다"보다 "보유한 설비 운용 역량으로 불량률 감소에 기여하겠다"처럼 실질적인 기여점을 쓰세요.'
    ]
  }
];

export default function CoverLetter() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const { user, userProfile } = useAuth();

  const userKey = user?.uid ? `mystair_cover_letter_${user.uid}` : 'mystair_cover_letter_guest';

  // Section answers state: { [sectionId]: text }
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      intro: '',
      strengths: '',
      competency: '',
      motive: ''
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showTips, setShowTips] = useState<Record<string, boolean>>({
    intro: true,
    strengths: false,
    competency: false,
    motive: false
  });

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

  // Auto-save debounced
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

  // Copy single section
  const handleCopySection = (id: string, title: string) => {
    const text = answers[id] || '';
    if (!text.trim()) {
      alert(t('복사할 작성 내용이 없습니다. 먼저 내용을 입력해주세요!'));
      return;
    }
    const fullText = `[${title}]\n${text}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy entire cover letter
  const handleCopyAll = () => {
    const headerInfo = `[${userProfile?.name || '지원자'} 자기소개서]\n- 지원 기업: ${targetCompany || '미정'}\n- 지원 직무/전공: ${targetRole || '미정'}\n- 작성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
    
    const body = DEFAULT_SECTIONS.map(sec => {
      const content = answers[sec.id]?.trim() || '(내용 없음)';
      return `------------------------------------\n${sec.title}\n------------------------------------\n${content}\n`;
    }).join('\n');

    navigator.clipboard.writeText(headerInfo + body);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Clear single section
  const handleClearSection = (id: string) => {
    if (window.confirm(t('이 항목의 작성 내용을 모두 지우시겠습니까?'))) {
      handleChange(id, '');
    }
  };

  // Total characters count
  const totalChars = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
  const totalCharsNoSpace = Object.values(answers).reduce((acc, curr) => acc + (curr ? curr.replace(/\s/g, '').length : 0), 0);

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      
      {/* Top Header */}
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 border-b shadow-xs ${isLightMode ? "bg-white/70 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-emerald-600' : 'text-white hover:text-emerald-400'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-1 sm:ml-2 shrink-0">
            {t('자기소개서 작성')}
          </span>
          <span className={`text-[13px] font-medium border-l pl-3 ml-2 hidden lg:block ${isLightMode ? 'text-slate-500 border-slate-300' : 'text-slate-400 border-slate-700'}`}>
            {t('마이스터·특성화고 표준 자소서 양식 & 글자수 세기')}
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
            onClick={handleCopyAll}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              copiedAll 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : isLightMode 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedAll ? t('전체 복사완료!') : t('전체 복사')}</span>
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
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* Banner Info Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
          isLightMode 
            ? "bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border-emerald-200/80 shadow-xs" 
            : "bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-800/40"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className={`text-lg sm:text-xl font-extrabold flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                <FileText className="text-emerald-500" size={22} />
                <span>{t('마이스터 자기소개서 표준 에디터')}</span>
              </h1>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>
                {t('보편적으로 기업 및 공공기관 채용에 요구되는 필수 4대 문항입니다. 작성 중인 내용은 브라우저에 실시간 자동 저장됩니다.')}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border shrink-0 text-xs font-bold ${
              isLightMode ? "bg-white/80 border-slate-200 text-slate-700" : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}>
              <div>
                <span className="text-[11px] text-slate-400 font-normal mr-1">{t('총 글자수')}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{totalChars}자</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div>
                <span className="text-[11px] text-slate-400 font-normal mr-1">{t('공백 제외')}:</span>
                <span>{totalCharsNoSpace}자</span>
              </div>
            </div>
          </div>

          {/* Target Company & Role Mini Input Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Building size={15} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-500 shrink-0">{t('희망 지원 기업')}:</span>
              <input 
                type="text" 
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder={t('예: 삼성전자, 한국전력공사, 포스코 등')}
                className={`flex-1 border rounded-lg px-2.5 py-1.5 font-semibold outline-none transition-colors ${
                  isLightMode 
                    ? "bg-white border-slate-200 text-slate-900 focus:border-emerald-500" 
                    : "bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <Target size={15} className="text-teal-500 shrink-0" />
              <span className="font-bold text-slate-500 shrink-0">{t('지원 직무 / 전공')}:</span>
              <input 
                type="text" 
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder={t('예: 설비보전, 기계설계, 제어 소프트웨어 등')}
                className={`flex-1 border rounded-lg px-2.5 py-1.5 font-semibold outline-none transition-colors ${
                  isLightMode 
                    ? "bg-white border-slate-200 text-slate-900 focus:border-emerald-500" 
                    : "bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Tip Banner referencing Growth Diary */}
        <div className={`p-3.5 rounded-xl border mb-6 flex items-start gap-2.5 text-xs ${
          isLightMode ? "bg-amber-50/70 border-amber-200/70 text-amber-900" : "bg-amber-950/20 border-amber-800/40 text-amber-200"
        }`}>
          <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">{t('💡 작성 팁')}: </span>
            <span>{t('자기소개서 작성 시 무엇을 쓸지 막막하다면, ')}</span>
            <Link to="/diary" className="font-bold underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 ml-0.5 mr-0.5">
              {t('성장다이어리')}
            </Link>
            <span>{t('의 ')}<strong className="text-slate-800 dark:text-slate-100">[자소서 요약]</strong>{t(' 버튼을 눌러보세요! 지금까지 작성한 일기 기록들을 바탕으로 STAR 공법에 맞춘 자소서 소재가 자동 추천됩니다.')}</span>
          </div>
        </div>

        {/* Question Sections Accordion / Forms */}
        <div className="space-y-6">
          {DEFAULT_SECTIONS.map((sec, idx) => {
            const currentVal = answers[sec.id] || '';
            const charCount = currentVal.length;
            const charCountNoSpace = currentVal.replace(/\s/g, '').length;
            const isOver = charCount > sec.recommendedChars + 100;
            const isTipOpen = !!showTips[sec.id];

            return (
              <div 
                key={sec.id}
                className={`rounded-2xl border transition-all ${
                  isLightMode 
                    ? "bg-white border-slate-200 shadow-sm hover:border-slate-300" 
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm"
                }`}
              >
                {/* Question Header */}
                <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLightMode ? "border-slate-100 bg-slate-50/60 rounded-t-2xl" : "border-slate-800 bg-slate-800/40 rounded-t-2xl"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className={`text-base sm:text-lg font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        {t(sec.title)}
                      </h2>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLightMode ? "bg-white border-slate-200 text-slate-600" : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}>
                        {t('권장')} {sec.recommendedChars}{t('자 내외')}
                      </span>
                    </div>
                    <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                      {t(sec.subtitle)}
                    </p>
                  </div>

                  {/* Question Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTips(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isTipOpen
                          ? isLightMode ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : isLightMode ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-100" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                      title={t('작성 팁 보기')}
                    >
                      <HelpCircle size={13} />
                      <span>{t('작성 가이드')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySection(sec.id, sec.title)}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        copiedId === sec.id
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : isLightMode ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-100" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                      title={t('이 항목만 복사')}
                    >
                      {copiedId === sec.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === sec.id ? t('복사됨!') : t('복사')}</span>
                    </button>

                    {currentVal && (
                      <button
                        type="button"
                        onClick={() => handleClearSection(sec.id)}
                        className={`text-[11px] font-bold p-1.5 rounded-lg border text-rose-500 transition-colors cursor-pointer ${
                          isLightMode ? "bg-white border-slate-200 hover:bg-rose-50 hover:border-rose-200" : "bg-slate-800 border-slate-700 hover:bg-rose-950/50"
                        }`}
                        title={t('내용 비우기')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Guidance Tips */}
                {isTipOpen && (
                  <div className={`px-5 py-3 border-b text-xs space-y-1.5 ${
                    isLightMode ? "bg-emerald-50/40 border-emerald-100 text-slate-700" : "bg-emerald-950/20 border-emerald-900/40 text-slate-300"
                  }`}>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                      <Sparkles size={13} />
                      <span>{t('이 문항 작성 핵심 팁')}</span>
                    </div>
                    {sec.tips.map((tip, tIdx) => (
                      <p key={tIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{t(tip)}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Textarea Input Box (matching user style) */}
                <div className="p-4 sm:p-5 space-y-2">
                  <textarea
                    rows={7}
                    value={currentVal}
                    onChange={e => handleChange(sec.id, e.target.value)}
                    placeholder={t(sec.placeholder)}
                    className={`w-full border rounded-xl p-4 text-sm font-medium outline-none leading-relaxed transition-all resize-y ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:shadow-xs" 
                        : "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-800"
                    }`}
                  />

                  {/* Character Counter & Helper Footer */}
                  <div className="flex items-center justify-between pt-1 px-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold transition-colors ${
                        isOver 
                          ? "text-rose-500 font-extrabold" 
                          : charCount > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : isLightMode ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {charCount}자
                      </span>
                      <span className={isLightMode ? "text-slate-300" : "text-slate-600"}>/</span>
                      <span className={isLightMode ? "text-slate-400" : "text-slate-500"}>
                        {t('공백제외')} {charCountNoSpace}자
                      </span>
                      <span className={isLightMode ? "text-slate-300" : "text-slate-600"}>•</span>
                      <span className={`text-[11px] ${charCount >= sec.recommendedChars * 0.7 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}>
                        {Math.round((charCount / sec.recommendedChars) * 100)}% {t('작성')}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {isOver ? t('⚠️ 권장 분량을 초과했습니다') : t('실시간 자동 저장 중')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Floating/Bottom Action Bar */}
        <div className={`mt-8 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="text-xs text-slate-500">
            <p className="font-bold text-slate-700 dark:text-slate-300">{t('💡 작성한 자기소개서 활용 안내')}</p>
            <p className="mt-0.5">{t('[전체 복사] 버튼을 누르면 워드(Word), 한글(HWP), 채용 사이트에 바로 붙여넣을 수 있습니다.')}</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyAll}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                copiedAll 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' 
                  : isLightMode 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copiedAll ? <Check size={15} /> : <Copy size={15} />}
              <span>{copiedAll ? t('전체 내용 복사완료!') : t('전체 복사하기')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>{t('저장하기')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
