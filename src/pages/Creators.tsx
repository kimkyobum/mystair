import React from 'react';
import { ArrowLeft, Sparkles, Code2, Palette, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Creators() {
  return (
    <div className="h-full flex-1 overflow-y-auto bg-slate-950 text-white font-sans p-6 md:p-12 relative">
      {/* Background Ambient Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft size={16} />
            <span>메인으로 돌아가기</span>
          </Link>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold mb-4">
            <Sparkles size={14} />
            <span>CREATORS & CONTRIBUTORS</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Mystair를 만든 사람들
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-normal leading-relaxed">
            전국 마이스터고 및 특성화고 학생들의 더 높은 꿈과 내일을 응원하며<br className="hidden sm:inline" />
            더 직관적이고 완성도 높은 취업·진로 솔루션을 만들기 위해 기획하고 개발한 팀입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-teal-400/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-5 border border-teal-500/30">
                <Code2 size={24} />
              </div>
              <span className="text-xs font-bold text-teal-400 tracking-wider uppercase block mb-1">Lead Developer & Planner</span>
              <h3 className="text-xl font-bold text-white mb-2">MyStair Team</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                마이스터고 커리큘럼 및 진로 데이터 분석, AI 프롬프트 엔지니어링 및 전체 웹 플랫폼 총괄 개발.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>AI & Full-stack</span>
              <span className="text-teal-400">Meister Platform</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-cyan-400/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/30">
                <Palette size={24} />
              </div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase block mb-1">UI/UX & Product Design</span>
              <h3 className="text-xl font-bold text-white mb-2">Design & Experience</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                학생들이 부담 없이 쉽게 마이페이지, 성장 일기, MBTI 및 홀랜드 검사를 이용할 수 있는 다크 글래스모피즘 인터페이스 설계.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>User Interface</span>
              <span className="text-cyan-400">Responsive UI</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-purple-400/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/30">
                <Database size={24} />
              </div>
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase block mb-1">Data & Content Research</span>
              <h3 className="text-xl font-bold text-white mb-2">Meister Data Team</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                전국 마이스터고 위치 데이터, 전공별 필수 자격증 추천 정보, 주요 대기업/공기업 가이드라인 수집 및 검증.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Research & DB</span>
              <span className="text-purple-400">Career Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
