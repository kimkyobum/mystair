/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, ArrowLeft, Globe, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TeamCard } from "../components/TeamCard";
import { teamMembers } from "../data/teamMembers";
import { SchoolLogo3D } from "../components/SchoolLogo3D";

export default function Creators() {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="h-full flex-1 overflow-y-auto min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30 relative">
      {/* Background Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 pb-32 relative z-10">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-14">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>메인으로 돌아가기</span>
          </Link>

          <button
            onClick={() => {
              sessionStorage.setItem('viewingPromo', 'true');
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 px-5 py-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
          >
            <Globe size={16} />
            <span>홍보사이트 보기</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full"
          >
            <SchoolLogo3D />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8"
          >
            <span className="text-sm font-bold tracking-wide text-cyan-400 uppercase">
              TEAM AMP &nbsp;&middot;&nbsp; Gumi Electronic Tech High School
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6"
          >
            Mystair를 만든 사람들
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg text-gray-400 max-w-2xl leading-relaxed font-medium"
          >
            구미전자공업고등학교 2학년 주역들이 의기투합하여 기획하고 개발한<br className="hidden sm:block" />
            전국 마이스터고 학생 맞춤형 AI 커리어·진로 탐색 플랫폼입니다.
          </motion.p>
        </div>

        {/* Team AMP Story Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121622] via-[#16142c] to-[#121622] border border-white/5 p-8 md:p-12 mb-24 shadow-2xl"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto text-center">
            
            {/* Header: Logo and Title */}
            <div className="flex flex-col items-center mb-10">
              {/* AMP Logo Container */}
              <div className="mb-6 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_0_40px_rgba(79,70,229,0.15)] inline-flex items-center justify-center min-w-[160px] min-h-[64px]">
                {!logoError ? (
                  <img 
                    src="/amp-logo.png" 
                    alt="Team AMP Logo" 
                    className="h-12 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center">
                     <span className="text-4xl font-black bg-gradient-to-r from-[#2c3e50] via-[#34495e] to-[#6a4299] bg-clip-text text-transparent tracking-tighter" style={{ fontFamily: 'sans-serif' }}>
                       AMP
                     </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-black text-white tracking-widest uppercase">
                  Team AMP
                </h2>
              </div>
            </div>

            {/* Content: Team Story */}
            <div className="space-y-6">
              <p className="text-[15px] md:text-base text-gray-300 leading-relaxed font-medium">
                저희 Team AMP는 <strong className="text-indigo-400 font-bold">'마이스터고 학생들의 잠재력을 증폭시키다'</strong>라는 비전으로 뭉친 구미전자공업고등학교 2학년 학생들입니다.
              </p>
              
              <p className="text-[15px] md:text-base text-gray-400 leading-relaxed">
                저희는 현장에서 매일 치열하게 실습과 프로젝트를 소화하지만, 이를 체계적으로 남길 시스템이 없어 취업 시즌마다 자소서 작성에 막막함을 느끼는 선배와 친구들을 누구보다 가까이서 지켜봤습니다.
              </p>

              <blockquote className="py-4 px-6 my-8 border-l-2 border-indigo-500/50 bg-indigo-500/5 text-indigo-200 font-medium italic rounded-r-lg">
                "우리의 땀방울이 밴 소중한 경험들이 휘발되지 않고, 합격을 부르는 확실한 스펙이 될 수는 없을까?"
              </blockquote>

              <p className="text-[15px] md:text-base text-gray-400 leading-relaxed">
                이 질문에 대한 답을 찾기 위해, 마이스터고 학생들의 페인포인트를 가장 뼈저리게 공감하는 저희가 직접 나섰습니다. 단순한 개발을 넘어, 우리들의 진짜 가치를 되찾아줄 <strong className="text-white font-semibold">'나만의 전용 AI 커리어 빌더, MyStair'</strong>를 통해 특성화고 학생들의 성공적인 취업 여정을 돕겠습니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>

        {/* Signature Footer Banner */}
        <div className="border border-white/10 rounded-2xl p-6 md:p-8 text-center bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-md">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-300 mb-1">
            <Award size={18} className="text-cyan-400" />
            <span>DEVELOPED BY GUMI ELECTRONIC TECHNICAL HIGH SCHOOL TEAM AMP</span>
          </div>
          <p className="text-xs mt-1 text-slate-400">
            마이스터고 학생들의 열정과 기술력으로 제작된 플랫폼입니다. 꿈을 향한 힘찬 첫걸음을 응원합니다.
          </p>
        </div>

      </main>
    </div>
  );
}
