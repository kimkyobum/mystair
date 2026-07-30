import React from 'react';
import { ArrowLeft, Sparkles, Terminal, Layers, Cpu, GraduationCap, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';

export default function Creators() {
  const { t } = useLanguage();

  const creators = [
    {
      name: "김교범",
      school: "구미전자공업고등학교 2학년",
      role: "GitHub & Main Page Design",
      codeName: "DEV // 01",
      description: "프로젝트 깃허브(GitHub) 레포지토리 관리 및 협업 파이프라인 구축, Mystair 메인페이지 UI/UX 디자인 담당.",
      tags: ["GitHub", "Main Page Design", "UI/UX"],
      accent: "from-cyan-500 to-blue-600",
      accentText: "text-cyan-400",
      borderHover: "hover:border-cyan-500/50",
      glow: "hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]",
      icon: Terminal,
      bgAccent: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
    },
    {
      name: "박영진",
      school: "구미전자공업고등학교 2학년",
      role: "Backend & Data Collection",
      codeName: "BACKEND // 02",
      description: "서비스 백엔드 서버 및 API 통신 설계, 전국 마이스터고 및 기업 취업 데이터 수집·분석 담당.",
      tags: ["Backend Dev", "Data Collection", "Database"],
      accent: "from-purple-500 to-indigo-600",
      accentText: "text-purple-400",
      borderHover: "hover:border-purple-500/50",
      glow: "hover:shadow-[0_0_35px_rgba(168,85,247,0.18)]",
      icon: Layers,
      bgAccent: "bg-purple-500/10 border-purple-500/30 text-purple-300"
    },
    {
      name: "노현우",
      school: "구미전자공업고등학교 2학년",
      role: "Planning & Promo Page Design",
      codeName: "PLAN // 03",
      description: "서비스 기획 및 스토리보드 설계, 브랜드 소개를 위한 홍보페이지 UI/UX 디자인 및 인터랙션 담당.",
      tags: ["Service Planning", "Promo Page Design", "UI/UX"],
      accent: "from-emerald-400 to-teal-600",
      accentText: "text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      glow: "hover:shadow-[0_0_35px_rgba(16,185,129,0.18)]",
      icon: Cpu,
      bgAccent: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
    }
  ];

  return (
    <div className="h-full flex-1 overflow-y-auto bg-[#07090E] text-white font-sans p-6 md:p-12 relative">
      {/* Ambient Sci-Fi Glow Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2.5 rounded-full border border-white/10 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>{t('메인으로 돌아가기')}</span>
          </Link>

          <button
            onClick={() => {
              sessionStorage.removeItem('isLoggedIn');
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:text-teal-200 transition-all duration-200 bg-teal-500/10 hover:bg-teal-500/20 px-5 py-2.5 rounded-full border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)] cursor-pointer"
          >
            <span>🌐 홍보사이트 보기</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest uppercase mb-5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Sparkles size={14} className="animate-pulse text-cyan-400" />
            <span>{t('GUMI ELECTRONIC TECH HIGH SCHOOL')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-5">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t('Mystair를 만든 사람들')}
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            {t('구미전자공업고등학교 2학년 주역들이 의기투합하여 기획하고 개발한')}
            <br className="hidden sm:inline" />
            {t('전국 마이스터고 학생 맞춤형 AI 커리어·진로 탐색 플랫폼입니다.')}
          </p>
        </div>

        {/* Creators Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {creators.map((creator, index) => {
            const IconComponent = creator.icon;
            return (
              <div 
                key={index}
                className={`group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 ${creator.borderHover} rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between ${creator.glow} hover:-translate-y-1.5`}
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${creator.accent} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-black tracking-widest uppercase text-slate-400 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                      {creator.codeName}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${creator.bgAccent}`}>
                      <IconComponent size={18} />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 group-hover:text-white transition-colors">
                      {t(creator.name)}
                    </h3>
                    
                    {/* School Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-200 text-xs sm:text-sm font-bold">
                      <GraduationCap size={15} className={creator.accentText} />
                      <span>{t(creator.school)}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div className={`text-xs font-extrabold uppercase tracking-wider ${creator.accentText} mb-3`}>
                    {creator.role}
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {t(creator.description)}
                  </p>
                </div>

                {/* Footer Tags */}
                <div>
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                    {creator.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-[11px] font-semibold bg-white/[0.04] text-slate-400 px-2.5 py-1 rounded-lg border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Signature Footer Banner */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 md:p-8 text-center backdrop-blur-md">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-300 mb-1">
            <Award size={18} className="text-cyan-400" />
            <span>{t('DEVELOPED BY GUMI ELECTRONIC TECHNICAL HIGH SCHOOL TEAM')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('마이스터고 학생들의 열정과 기술력으로 제작된 플랫폼입니다. 꿈을 향한 힘찬 첫걸음을 응원합니다.')}
          </p>
        </div>
      </div>
    </div>
  );
}

