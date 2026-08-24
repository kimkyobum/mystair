import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Award, ExternalLink, Code } from 'lucide-react';
import { TeamMember } from '../data/teamMembers';

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export function TeamCard({ member, index }: TeamCardProps) {
  const IconComponent = member.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 * index, ease: "easeOut" }}
      className={`group relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-[#111625]/90 via-[#0e1320]/95 to-[#0b0f19] border border-white/10 ${member.borderHover} ${member.glow} hover:-translate-y-1.5 backdrop-blur-xl shadow-xl`}
    >
      {/* Top Accent Gradient Bar */}
      <div 
        className={`absolute top-0 left-7 right-7 h-[2.5px] bg-gradient-to-r ${member.accent} rounded-full opacity-70 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-300`} 
      />

      <div>
        {/* Card Header: CodeName & Role Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-400 font-mono">
            {member.codeName}
          </span>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${member.bgAccent} transition-transform group-hover:scale-110 duration-300 shadow-md`}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Member Name & School */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              {member.name}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
              {member.badge}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs sm:text-sm font-semibold mt-2.5">
            <GraduationCap className={`w-4 h-4 ${member.accentText}`} />
            <span>{member.school} {member.grade}</span>
          </div>
        </div>

        {/* Role Title */}
        <div className={`text-xs font-extrabold uppercase tracking-wider ${member.accentText} mb-3.5 flex items-center gap-1.5`}>
          <Code className="w-3.5 h-3.5 opacity-80" />
          <span>{member.role}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
          {member.description}
        </p>
      </div>

      {/* Footer Skill / Focus Tags */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-1.5">
          {member.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-400 border border-white/5 group-hover:border-white/10 group-hover:text-slate-300 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
