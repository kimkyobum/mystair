import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Users, Activity, CreditCard, ChevronRight, ChevronDown, BookOpen, Rocket, Compass, Calendar, Sparkles, Target, CheckCircle, Flame, FileText, AlertCircle, PenTool, LayoutTemplate, ArrowRight, Cpu, Network } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const skills = [
  "진로", "마이스터", "다이어리", "자격증", "직무검사", "기능사"
];

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

const FAQItem = ({ q, a, index }: { q: string, a: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  return (
    <FadeIn delay={0.1 * (index + 1)}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold group-hover:text-teal-400 transition-colors">Q. {t(q)}</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 group-hover:text-white transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <p className="text-gray-400 text-sm leading-relaxed">A. {t(a)}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default function Dashboard({ onNavigateToLogin }: { onNavigateToLogin?: () => void }) {
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const { t } = useLanguage();

  const faqData = [
    {
      q: "일반 고등학교 학생도 함께할 수 있나요?",
      a: "네, 일반 고등학교 학생도 이용할 수 있습니다! 교내외 다양한 활동과 경험을 캘린더에 기록하고, 이를 바탕으로 나만의 진솔한 자소서 소재를 발굴하는 데 유용하게 활용할 수 있습니다."
    },
    {
      q: "AI 자소서 소재는 어떻게 만들어지나요?",
      a: "캘린더에 차곡차곡 적어둔 생생한 실습과 트러블슈팅 경험들을 바탕으로, 기업이 선호하는 STAR 구조(상황-과제-행동-결과)에 맞추어 진솔하게 다듬어 드립니다."
    },
    {
      q: "기록한 소중한 데이터는 안전한가요?",
      a: "학생들이 정성껏 쌓아올린 모든 커리어 기록들은 안전하게 보호되며, 언제든 대시보드에서 편안하게 꺼내어 수정하고 활용하실 수 있습니다."
    }
  ];

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-48 sm:pb-64 text-white">
      
      {/* Hero Section */}
      <section className="min-h-[55vh] sm:min-h-[60vh] flex flex-col justify-start pt-16 sm:pt-24 relative">
        <FadeIn>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight break-keep">
            {t('내 손으로 만들어가는', 'Building with my own hands')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">
              {t('당신만의 멋진 계단', 'Your Own Amazing Stairs')}
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-base sm:text-xl md:text-2xl text-gray-400 font-medium mb-8 sm:mb-10 max-w-2xl leading-relaxed break-keep">
            {t('당신의 노력의 땀방울이 꿈을 이루는', 'Every drop of your effort will become')}<br className="hidden sm:block" /> {t('가장 단단한 다리가 되어줄 거에요.', 'the solid bridge to achieve your dreams.')}
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <button onClick={onNavigateToLogin} className="relative z-30 flex items-center justify-center gap-2 bg-white text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)] pointer-events-auto cursor-pointer w-full sm:w-auto">
            {t('무료로 시작하기', 'Start for Free')} <ArrowUpRight className="w-5 h-5" />
          </button>
        </FadeIn>

        {/* Scroll down indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-10 h-10 text-white/50" />
        </motion.div>
      </section>

      {/* Infinite Marquee Section */}
      <section className="mt-32 overflow-hidden w-full relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-4 pr-4">
              {skills.map((skill, index) => (
                <div key={index} className="inline-flex items-center px-6 py-2.5 rounded-full border border-white/10 bg-[#0a0a0a]/90 text-gray-300 font-medium text-sm shadow-[inset_0_1px_4px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]">
                  <span className="text-teal-400 mr-2 font-bold opacity-80">#</span>
                  <span className="tracking-wide">{t(skill)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM STATEMENT Section */}
      <section className="mt-64">
        <FadeIn>
          <div className="mb-12">
            <h3 className="text-teal-400 font-bold tracking-widest text-sm mb-4 uppercase">Pain Points</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('왜 MyStair가 필요할까요?')}</h2>
            <p className="text-gray-400 text-lg">{t('마이스터고 학생들의 교육 및 취업 준비 과정에서 발생하는 핵심 고민들입니다.')}</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-red-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bullseye/3D/bullseye_3d.png" alt="Target" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('목표 달성의 막막함')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm relative z-10">
                {t('"대기업/공기업 합격"이라는 큰 목표는 있지만 매일 당장 무엇을 공부하고 어떤 실습에 집중해야 하는지 잘 알지 못합니다.', 'You have a big goal of joining a top corporation, but you are unsure what to study and practice every day.')}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-orange-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hourglass%20not%20done/3D/hourglass_not_done_3d.png" alt="Hourglass" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('경험의 빠른 휘발')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm relative z-10">
                {t('1~2학년 동안 경험한 실습 경험과 대회 경험을 기록해 두지 않아 3학년 자소서 작성 시 소재 고갈에 시달립니다.', 'Not recording lab and competition experiences in 1st & 2nd year leaves you with a lack of material when writing senior cover letters.')}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-pink-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Puzzle%20piece/3D/puzzle_piece_3d.png" alt="Puzzle" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('맞춤 소재 연결의 어려움')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm relative z-10">
                {t('지원하려는 기업과 자소서 문항의 NCS 역량 지표에 내 3년간의 실습 경험을 어떻게 녹여내야 할지 몰라 작성에 난항을 겪습니다.', 'Difficulty connecting 3 years of lab practice into target company NCS competency standards.')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CORE FEATURES Section */}
      <section className="mt-64">
        <FadeIn>
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div>
              <h3 className="text-teal-400 font-bold tracking-widest text-sm mb-4 uppercase">Core Features</h3>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('커리어 코칭 계단, MyStair')}</h2>
              <p className="text-gray-400 text-lg">{t('매일 쌓인 실습 기록을 지원 기업 맞춤형 자소서 소재로 정밀 추출해 드립니다.')}</p>
            </div>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-blue-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Office%20building/3D/office_building_3d.png" alt="Office building" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('나의 맞춤 기업 찾기')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm mb-8 relative z-10">
                {t('나의 전공학과, 성향(MBTI/홀랜드), 성장 기록을 바탕으로 나에게 가장 잘 어울리는 꿈의 기업을 AI가 매칭해 줍니다.')}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit mt-auto border border-blue-500/20">
                <Compass className="w-3 h-3 animate-pulse" /> {t('맞춤 추천 기업 탐색')}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-emerald-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Spiral%20calendar/3D/spiral_calendar_3d.png" alt="Calendar" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('경험 기록 & 노력 일수 시각화')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm mb-8 relative z-10">
                {t('교내외 실습, 대회 경험을 기록하세요. 매일 기록할 때마다 캘린더에 완수 스탬프가 적재되어 성취감을 높입니다.')}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1.5 rounded-md border border-emerald-500/20">#PLC</span>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1.5 rounded-md border border-emerald-500/20">#Circuit</span>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1.5 rounded-md border border-emerald-500/20">#Troubleshooting</span>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-amber-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-amber-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png" alt="Sparkles" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('자소서 핵심 요소 & STAR 가이드', 'Cover Letter Core Elements & STAR Guide')}</h3>
              <p className="text-gray-400 leading-relaxed text-sm mb-8 relative z-10">
                {t('AI가 대필하는 것이 아니라, 지원하는 기업과 자소서 문항에 맞춰 내 실습 기록에서 최적의 경험 요소를 추출하고 STAR 구조의 뼈대를 완성해 줍니다.', 'Extracting optimal experience elements from your practice records tailored to target companies in STAR structure.')}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full w-fit mt-auto border border-amber-500/20">
                <LayoutTemplate className="w-3 h-3" /> {t('NCS 역량 매핑')}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* UNFAIR ADVANTAGE Section */}
      <section className="mt-64">
        <FadeIn>
          <div className="mb-12">
            <h3 className="text-teal-400 font-bold tracking-widest text-sm mb-4 uppercase">Unfair Advantage</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('MyStair만의 솔루션', 'MyStair Exclusive Solution')}</h2>
            <p className="text-gray-400 text-lg">{t('기존 AI 생성 방식의 한계를 뛰어넘는 마이스터고 특화 솔루션을 제공합니다.', 'Providing vocational high school specialized solutions beyond general AI limits.')}</p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 h-full flex flex-col hover:bg-white/10 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ease-out">
                <Cpu className="w-48 h-48" />
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl inline-block mb-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] w-fit relative z-10">
                <Cpu className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{t('전공/실습 특화 AI 프롬프트', 'Major & Lab Specialized AI Prompts')}</h3>
              <p className="text-gray-400 leading-relaxed text-lg relative z-10">
                {t('일반적인 범용 AI가 아닌, 마이스터고와 특성화고의 전문적인 실습 및 프로젝트 도메인에 맞추어 미세 조정된 프롬프트 알고리즘을 사용합니다. 기계적인 문장이 아닌 학생의 진짜 경험을 돋보이게 합니다.', 'Using fine-tuned algorithms tailored for specialized technical high school domains.')}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 h-full flex flex-col hover:bg-white/10 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ease-out">
                <Network className="w-48 h-48" />
              </div>
              <div className="bg-teal-500/20 p-4 rounded-2xl inline-block mb-8 border border-teal-500/30 shadow-[0_0_30px_rgba(45,212,191,0.2)] w-fit relative z-10">
                <Network className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{t('NCS 역량 매핑 & 통합 AI 연동', 'NCS Competencies & Integrated AI Linking')}</h3>
              <p className="text-gray-400 leading-relaxed text-lg relative z-10">
                {t('전국 마이스터고의 교육 과정과 실습 과목 데이터를 중심으로 풍부한 전공지식 베이스가 완벽하게 구축되어 있습니다. 일기 작성부터 진로 진단(MBTI/Holland), 자소서 핵심 요소 분석에 이르는 모든 기능들이 MyStair AI 플랫폼과 유기적으로 연동되어 나만의 맞춤형 취업 파이프라인을 완성합니다.', 'Connecting diary, aptitude tests, and cover letters into a seamless career pipeline.')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Expected Impact */}
      <section className="mt-64">
        <FadeIn>
          <div className="mb-12 flex flex-col items-center text-center">
            <h3 className="text-teal-400 font-bold tracking-widest text-sm mb-4 uppercase">Expected Impact</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('어떤 변화가 일어날까요?', 'What Changes Will Happen?')}</h2>
            <p className="text-gray-400 text-lg">{t('모두가 만족하는 긍정적인 내일의 모습입니다.', 'A positive future satisfying students and schools alike.')}</p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* 학생 */}
          <FadeIn delay={0.1}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 pointer-events-auto">
              <div className="bg-indigo-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-indigo-500/30">
                <Users className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{t('학생 관점', 'Student Perspective')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('AI 대필이 아닌 본인의 정직한 실습 기록을 기반으로 스스로 자소서를 채워나갈 수 있는 핵심 요소를 확보하여 진정성과 신뢰도가 극대화됩니다.', 'Build authentic cover letters based on honest practice logs with maximized credibility.')}
              </p>
            </div>
          </FadeIn>

          {/* 학교 */}
          <FadeIn delay={0.2}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 pointer-events-auto">
              <div className="bg-teal-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-teal-500/30">
                <LayoutTemplate className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{t('학교 관점', 'School Perspective')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('학생들의 일상적인 준비 상태 모니터링, 체계적인 경력 포트폴리오 관리 및 교사의 자소서 지도 효율화가 이루어집니다.', 'Enable teachers to monitor student readiness and manage career portfolios efficiently.')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-64 pb-32">
        <FadeIn>
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h3 className="text-teal-400 font-bold tracking-widest text-sm mb-4 uppercase">FAQ</h3>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('자주 묻는 질문 (FAQ)')}</h2>
            <p className="text-gray-400 text-lg">{t('서비스에 대해 가장 자주 문의하시는 질문들을 모았습니다.')}</p>
          </div>
        </FadeIn>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <FAQItem key={index} q={item.q} a={item.a} index={index} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-48 mb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-[100px] pointer-events-none"></div>
        <FadeIn>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden group pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight relative z-20 text-white">
              {t('경험이 스펙이 되는 첫걸음', 'The First Step Where Experience Becomes Merit')}
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-20">
              {t('더 이상 자소서 소재 고갈로 막막해하지 마세요. MyStair와 함께 당신의 노력 일수를 증명하세요.', 'Prove your effort days with MyStair and never worry about running out of topic ideas.')}
            </p>
            <button onClick={onNavigateToLogin} className="relative z-30 bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)] pointer-events-auto flex items-center gap-3 mx-auto cursor-pointer">
              {t('지금 시작하기', 'Start Now')} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="mt-32 pt-12 border-t border-white/10 pb-12">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-2 text-white">MyStair</h2>
              <p className="text-gray-400 text-sm mb-4">{t('구미전자공고 학생들이 만든 웹사이트입니다', 'A website built by students of Gumi Electronic Technical High School')}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-gray-500 text-xs">
                <span>{t('© 2026 MyStair Inc. All rights reserved. 마이스터고 학생들의 눈부시고 찬란한 내일을 진심으로 응원합니다.', '© 2026 MyStair Inc. All rights reserved. Sincerely supporting the bright future of vocational high school students.')}</span>
                <button 
                  onClick={() => setShowCopyrightModal(true)}
                  className="text-teal-400 hover:text-teal-300 underline font-semibold transition-colors cursor-pointer pointer-events-auto"
                >
                  {t('저작권 정보', 'Copyright Information')}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </footer>

      {/* Copyright Modal */}
      {showCopyrightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowCopyrightModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl pointer-events-auto text-left"
          >
            <h3 className="text-xl font-bold mb-4 text-white">{t('MyStair 3D 저작권 정보', 'MyStair 3D Copyright Info')}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t('MyStair 플랫폼에서 사용된 3D 인터랙티브 그래픽 에셋은 Spline Community의 창작물을 라이선스에 따라 합법적으로 사용하고 있습니다.', '3D interactive graphic assets are legally used from Spline Community under license.')}
            </p>
            <div className="flex flex-col gap-3 mb-8">
              <a 
                href="https://app.spline.design/community/file/6c10e2d8-a3e4-43a6-b43c-eecbbd75cf78" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white group"
              >
                <span className="text-sm font-semibold group-hover:text-teal-400 transition-colors">🤖 {t('로봇 3D 모델 저작권', 'Robot 3D Model Copyright')}</span>
                <span className="text-xs text-teal-400 flex items-center gap-1 group-hover:underline">{t('바로가기', 'Open')} <ArrowUpRight className="w-3.5 h-3.5" /></span>
              </a>
              <a 
                href="https://app.spline.design/community/file/75f6717a-d4ba-4410-8213-073609079677" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white group"
              >
                <span className="text-sm font-semibold group-hover:text-teal-400 transition-colors">🌌 {t('우주 3D 모델 저작권', 'Space 3D Model Copyright')}</span>
                <span className="text-xs text-teal-400 flex items-center gap-1 group-hover:underline">{t('바로가기', 'Open')} <ArrowUpRight className="w-3.5 h-3.5" /></span>
              </a>
            </div>
            <button 
              onClick={() => setShowCopyrightModal(false)}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {t('닫기', 'Close')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
