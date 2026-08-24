import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Cpu, GraduationCap, Zap } from 'lucide-react';

export function SchoolLogo3D() {
  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Dynamic 3D Floating Emblem Container */}
      <motion.div
        className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center"
        initial={{ y: 0 }}
        animate={{ 
          y: [-6, 6, -6],
          rotateZ: [-1, 1, -1]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute inset-2 bg-indigo-500/25 rounded-full blur-xl" />

        {/* Rotating Outer Tech Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-dashed border-cyan-400/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />

        {/* Counter Rotating Ring */}
        <motion.div 
          className="absolute inset-2 rounded-full border border-dotted border-indigo-400/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* 3D Glass Emblem Base */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#10192e]/95 to-slate-950/95 border-2 border-cyan-400/40 shadow-[0_10px_40px_rgba(6,182,212,0.3)] backdrop-blur-md flex flex-col items-center justify-center p-3 overflow-hidden group">
          {/* Inner Light Sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
          
          {/* Corner Tech Accents */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

          {/* Central School Icon & Crest */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative mb-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300" />
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            {/* School Short Title */}
            <span className="text-[11px] sm:text-xs font-black tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-white to-cyan-300">
              구미전자공고
            </span>
            <span className="text-[9px] font-bold text-cyan-400 tracking-widest uppercase">
              EST. 1954
            </span>
          </div>

          {/* Floating Small Orbiting Particle */}
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
            animate={{
              x: [0, 42, 0, -42, 0],
              y: [-42, 0, 42, 0, -42],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
