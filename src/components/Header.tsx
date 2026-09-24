import { useState } from 'react';
import { Menu, X, BookOpen, Award, Briefcase, Users, User, Sparkles, HelpCircle, FileText, Camera, ChevronDown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { createPortal } from 'react-dom';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { isLightMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeGuideTopic, setActiveGuideTopic] = useState<string | null>(null);
  const navigate = useNavigate();

  const guideTopics = [
    {
      id: 'company',
      num: '1',
      title: '나만의 기업찾기 사용법',
      icon: '🏢',
      path: '/company-search',
      pathLabel: '나만의 기업찾기 바로가기',
      summary: '마이페이지에 입력된 학교, 전공, MBTI, 홀랜드 적성검사를 MYSTAIR AI가 종합 분석하여, 회사의 인재상과 근무 환경을 고려한 맞춤형 대기업 및 공공기관 리스트를 추천합니다.',
      details: [
        '마이페이지에서 자신의 전공과 직업 적성 검사를 완료하면 더욱 높은 정확도로 맞춤 추천을 받을 수 있습니다.',
        '각 기업의 채용 형태, 신입 초봉, 필요 직무 역량, 마이스터고 선배들의 커리어 패스를 한눈에 비교할 수 있습니다.',
        '관심 있는 기업을 목표 기업으로 지정하여 마이페이지에서 집중적으로 취업 준비 현황을 추적하세요.'
      ]
    },
    {
      id: 'ai',
      num: '2',
      title: 'AI 사용법',
      icon: '🤖',
      path: '/',
      pathLabel: 'AI 홈 바로가기',
      summary: 'MYSTAIR의 모든 기능과 실시간 연동되어 24시간 나만의 1:1 진로 및 취업 컨설팅을 제공합니다.',
      prompts: [
        '오늘 ~활동을 했는데 내 다이어리에 기록해줘',
        '~기업에 취업하려면 어떤 필수 자격증이 필요해?',
        '나의 적성과 전공에 가장 적합한 기업과 직무는 어디야?',
        '~기업의 최신 면접 기출문제와 인재상을 알려줘'
      ],
      details: [
        '홈 화면의 AI 챗봇을 통해 일상적인 학습 질문부터 구체적인 취업 로드맵 상담까지 자유롭게 진행할 수 있습니다.'
      ]
    },
    {
      id: 'diary',
      num: '3',
      title: '성장 다이어리 사용법',
      icon: '✨',
      path: '/diary',
      pathLabel: '성장 다이어리 바로가기',
      summary: '하루하루 실습과 학교 생활을 기록하면, AI가 대내외활동, 수상, 자격증 등으로 자동 분류하고 STAR 기법(Situation, Task, Action, Result)으로 체계화합니다.',
      details: [
        '자유로운 일기 형식으로 매일의 실습 경험과 배운 점을 꾸준히 기록하세요.',
        'AI가 활동의 핵심 성과를 분석해 실전 자기소개서 소재로 전환 가능한 구조화된 기록으로 정리해 줍니다.',
        '💡 [자소서 요약] 버튼을 누르면 그동안 기록한 경험들이 지원서 항목별 맞춤 문장으로 즉시 정리됩니다.'
      ]
    },
    {
      id: 'certificates',
      num: '4',
      title: '자격증 가이드 사용법',
      icon: '📜',
      path: '/certificates',
      pathLabel: '자격증 가이드 바로가기',
      summary: '마이스터고 전공 분야별 필수 자격증의 시험 일정과 과목 정보를 확인하고, 큐넷(Q-Net) 등 공식 원서접수처로 바로 이동할 수 있습니다.',
      details: [
        '자격증 검색 창에서 취득하고자 하는 자격증의 기본 정보, 응시 자격, 시험 과목을 손쉽게 확인하세요.',
        '공식 홈페이지 URL 링크를 통해 원서접수 페이지로 즉시 연결되어 접수 일정을 놓치지 않습니다.',
        'MYSTAIR AI에게 자신의 전공에 어울리는 추천 자격증을 요청하면 맞춤형 자격증 로드맵을 설계해 줍니다.'
      ]
    },
    {
      id: 'mypage',
      num: '5',
      title: '마이페이지 & 맞춤 설정',
      icon: '👤',
      path: '/mypage',
      pathLabel: '마이페이지 바로가기',
      summary: '기본 학적 정보 관리, MBTI 및 홀랜드 직업 적성 검사, 희망 목표 기업 관리와 함께 화이트 / 우주 다크 테마를 자유롭게 설정할 수 있습니다.',
      details: [
        '기본 정보 & 학적: 고등학교, 전공 학과, 인적 사항을 입력하고 언제든 수정할 수 있습니다.',
        '진로 적성 진단: MBTI 및 홀랜드(RIASEC) 적성검사를 통해 나에게 최적화된 산업 분야를 진단합니다.',
        '환경 설정: 밝고 눈이 편안한 화이트 모드 또는 신비로운 별빛 우주 다크 모드 중 원하는 배경을 선택할 수 있습니다.'
      ]
    },
    {
      id: 'interview',
      num: '6',
      title: '자기소개서 & 모의 면접',
      icon: '🎯',
      path: '/interview',
      pathLabel: '모의 면접 바로가기',
      summary: '다이어리에 누적된 실습 기록을 바탕으로 합격 자기소개서를 완성하고, 목표 기업의 기출 예상 질문으로 실전 모의면접을 대비합니다.',
      details: [
        '자기소개서: AI가 다이어리 기록을 바탕으로 지원 기업 문항에 최적화된 STAR 답변을 완성해 줍니다.',
        '모의 면접: 실제 면접관과 대화하듯 실시간 음성/화상 연습을 진행하고 시선, 태도, 답변 내용에 대한 AI 맞춤 피드백을 받습니다.'
      ]
    }
  ];

  const navItems = [
    { name: 'MyStair AI 홈', path: '/', icon: <Sparkles size={18} className="text-teal-400" /> },
    { name: '성장다이어리', path: '/diary', icon: <BookOpen size={18} /> },
    { name: '모의면접', path: '/interview', icon: <Camera size={18} /> },
    { name: '자기소개서 작성', path: '/cover-letter', icon: <FileText size={18} /> },
    { name: '자격증 가이드', path: '/certificates', icon: <Award size={18} /> },
    { name: '나만의 기업찾기', path: '/company-search', icon: <Briefcase size={18} /> },
    { name: '만든 사람들', path: '/creators', icon: <Users size={18} /> },
    { name: '마이페이지', path: '/mypage', icon: <User size={18} /> }
  ];

  return (
    <>
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-2.5 sm:py-5 w-full max-w-full sm:max-w-[1600px] mx-auto box-border overflow-x-hidden min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-emerald-600' : 'text-white hover:text-emerald-400'} font-black text-lg sm:text-2xl md:text-[32px] tracking-[-0.06em] cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-none group select-none transition-all duration-300 hover:scale-105 active:scale-95 shrink-0`}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500 ease-out sm:w-[34px] sm:h-[34px] shrink-0">
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
              <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
            </svg>
            <span className={`transition-colors duration-300 shrink-0 ${isLightMode ? 'group-hover:text-teal-600' : 'group-hover:text-teal-300'}`}>Mystair</span>
          </Link>

          {/* Usage Guide Button */}
          <button
            onClick={() => {
              setActiveGuideTopic(null);
              setGuideModalOpen(true);
            }}
            title={t('사용방법', 'How to use')}
            className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap min-h-[34px] shrink-0 ${
              isLightMode 
                ? 'bg-white/60 hover:bg-white/80 backdrop-blur-md border-slate-300/70 text-slate-800 shadow-xs' 
                : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
            }`}
          >
            <HelpCircle size={14} className="text-teal-400 shrink-0" />
            <span className="hidden md:inline">{t('사용방법', 'How to use')}</span>
            <span className="inline md:hidden">{t('사용법', 'Guide')}</span>
          </button>
        </div>
        
        <nav className="hidden xl:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
          {navItems.slice(1, -1).map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`${isLightMode ? 'text-slate-700 hover:text-slate-950 font-semibold' : 'text-white/80 hover:text-white font-medium'} transition-colors text-[15px] whitespace-nowrap`}
            >
              {t(item.name)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Language Switcher Compact Toggle Button */}
          <div className={`flex items-center backdrop-blur-md border rounded-full p-0.5 text-[10px] sm:text-xs shrink-0 ${
            isLightMode ? 'bg-white/50 border-slate-300/70' : 'bg-white/10 border-white/20'
          }`}>
            <button 
              onClick={() => setLanguage('ko')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'ko' 
                  ? 'bg-teal-400 text-slate-950 shadow-sm' 
                  : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">한국어</span>
              <span className="inline sm:hidden">한</span>
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'en' 
                  ? 'bg-teal-400 text-slate-950 shadow-sm' 
                  : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">English</span>
              <span className="inline sm:hidden">EN</span>
            </button>
          </div>

          {/* Mobile Menu Icon Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('메뉴 열기', 'Open Menu')}
            title={t('메뉴 열기', 'Open Menu')}
            className={`xl:hidden cursor-pointer p-2 rounded-xl min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors shrink-0 ${
              isLightMode ? 'text-slate-900 hover:bg-slate-100 active:bg-slate-200' : 'text-white hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* USAGE GUIDE MODAL */}
      {guideModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={() => setGuideModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[88vh] border transition-colors ${
              isLightMode 
                ? 'bg-white text-slate-900 border-slate-200 shadow-slate-300/50' 
                : 'bg-slate-900 text-white border-slate-700 shadow-black/80'
            }`} 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
              isLightMode ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl border shrink-0 ${
                  isLightMode 
                    ? 'bg-teal-50 border-teal-200 text-teal-600' 
                    : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                }`}>
                  <HelpCircle size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg font-extrabold truncate ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    {t('Mystair AI 이용 가이드 & 사용법', 'Mystair AI User Guide')}
                  </h3>
                  <p className={`text-xs truncate ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {t('각 항목을 누르면 상세 사용법이 펼쳐집니다', 'Click an item to see its detailed guide')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setGuideModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  isLightMode 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Short & Concise Tour Trigger Banner */}
              <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isLightMode 
                  ? 'bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50/70 border-teal-200 text-teal-950' 
                  : 'bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/5 border-teal-500/30 text-white'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isLightMode ? 'bg-teal-100 text-teal-700' : 'bg-teal-500/30 text-teal-300'
                  }`}>
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs sm:text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      {t('화면 안내 가이드', 'Interactive Tour')}
                    </span>
                    <span className={`ml-2 text-[11px] sm:text-xs hidden xs:inline ${
                      isLightMode ? 'text-slate-500' : 'text-teal-200/80'
                    }`}>
                      {t('화면을 직접 둘러보며 배웁니다', 'Tour the screen directly')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGuideModalOpen(false);
                    window.dispatchEvent(new CustomEvent('open-onboarding-tour'));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <span>{t('체험 시작', 'Start Tour')}</span>
                  <span>🚀</span>
                </button>
              </div>

              {/* Expandable Topic Pages */}
              <div className="space-y-2">
                {guideTopics.map((topic) => {
                  const isOpen = activeGuideTopic === topic.id;
                  return (
                    <div 
                      key={topic.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isOpen 
                          ? isLightMode 
                            ? 'border-teal-300 shadow-xs' 
                            : 'border-teal-500/50 shadow-sm shadow-teal-500/10'
                          : isLightMode 
                            ? 'border-slate-200/90 hover:border-slate-300' 
                            : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Topic Header Button */}
                      <button
                        type="button"
                        onClick={() => setActiveGuideTopic(isOpen ? null : topic.id)}
                        className={`w-full flex items-center justify-between p-3 sm:p-3.5 text-left transition-colors cursor-pointer ${
                          isOpen
                            ? isLightMode 
                              ? 'bg-teal-50/80 text-teal-950' 
                              : 'bg-teal-950/40 text-teal-200'
                            : isLightMode 
                              ? 'bg-slate-50/70 hover:bg-slate-100/70 text-slate-800' 
                              : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base sm:text-lg shrink-0 select-none">{topic.icon}</span>
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {topic.num}. {topic.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                            isOpen
                              ? isLightMode ? 'bg-teal-200/70 text-teal-900' : 'bg-teal-500/30 text-teal-200'
                              : isLightMode ? 'bg-slate-200/70 text-slate-600' : 'bg-slate-700/60 text-slate-400'
                          }`}>
                            {isOpen ? t('접기', 'Collapse') : t('보기', 'View')}
                          </span>
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-teal-500' : isLightMode ? 'text-slate-400' : 'text-slate-500'
                            }`} 
                          />
                        </div>
                      </button>

                      {/* Topic Detailed Content Page */}
                      {isOpen && (
                        <div className={`p-4 sm:p-4.5 border-t space-y-3 animate-fade-in ${
                          isLightMode 
                            ? 'bg-white border-teal-200/70 text-slate-700' 
                            : 'bg-slate-800/30 border-teal-500/30 text-slate-300'
                        }`}>
                          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                            isLightMode ? 'text-slate-700' : 'text-slate-200'
                          }`}>
                            {topic.summary}
                          </p>

                          {/* Specific prompts if available */}
                          {topic.prompts && (
                            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                              isLightMode 
                                ? 'bg-teal-50/50 border-teal-200 text-teal-900' 
                                : 'bg-slate-900/90 border-slate-700/80 text-teal-200'
                            }`}>
                              <p className="font-bold flex items-center gap-1.5">
                                <span>💡</span>
                                <span>{t('추천 질문 예시:', 'Recommended Questions:')}</span>
                              </p>
                              {topic.prompts.map((prompt, idx) => (
                                <p key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-1.5 before:font-bold">
                                  {prompt}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Detail Bullet Points */}
                          <ul className="space-y-1.5 text-xs leading-relaxed">
                            {topic.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-teal-500 font-bold shrink-0 mt-0.5">•</span>
                                <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>{detail}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Direct Navigation Button */}
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setGuideModalOpen(false);
                                navigate(topic.path);
                              }}
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                                isLightMode 
                                  ? 'bg-teal-100 hover:bg-teal-200 text-teal-900' 
                                  : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30'
                              }`}
                            >
                              <span>{topic.pathLabel}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className={`mt-5 pt-3.5 border-t flex justify-end ${
              isLightMode ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md active:scale-95"
              >
                {t('확인 완료', 'Got it')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-[85vw] max-w-[320px] bg-slate-950/95 border-l border-white/15 h-full p-5 text-white flex flex-col justify-between shadow-2xl z-10 overflow-y-auto box-border">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2 font-black text-lg text-teal-300 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 shrink-0">
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(45 50 50)" />
                    <rect x="14" y="32" width="72" height="36" rx="18" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" transform="rotate(-45 50 50)" />
                  </svg>
                  <span className="whitespace-nowrap">{t('Mystair 메뉴', 'Mystair Menu')}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shrink-0"
                  aria-label={t('메뉴 닫기', 'Close Menu')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all min-h-[44px] whitespace-nowrap word-keep"
                  >
                    <span className="text-teal-400 shrink-0">{item.icon}</span>
                    <span className="truncate">{t(item.name)}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-white/10 flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveGuideTopic(null);
                  setGuideModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs sm:text-sm min-h-[44px] active:scale-98 transition-all whitespace-nowrap cursor-pointer"
              >
                <HelpCircle size={16} className="text-teal-400 shrink-0" />
                <span>{t('사용방법', 'How to use')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

