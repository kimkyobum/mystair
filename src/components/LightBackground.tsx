export default function LightBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-slate-50">
      {/* 1. Base subtle sky-cream background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/30" />

      {/* 2. Soft Cloud-like Organic Gradient Blends */}
      <div className="absolute -top-[10%] left-[5%] w-[70vw] h-[55vh] bg-gradient-to-r from-sky-200/35 via-indigo-200/30 to-purple-200/25 rounded-[100%] blur-[120px] animate-float-slow" />
      
      <div 
        className="absolute top-[25%] -right-[10%] w-[65vw] h-[60vh] bg-gradient-to-l from-teal-200/30 via-emerald-100/35 to-cyan-200/25 rounded-[100%] blur-[130px] animate-pulse-glow" 
      />

      <div 
        className="absolute -bottom-[10%] left-[15%] w-[75vw] h-[50vh] bg-gradient-to-t from-rose-100/35 via-purple-100/30 to-sky-200/25 rounded-[100%] blur-[140px] animate-float-slow" 
        style={{ animationDelay: '-7s' }} 
      />
    </div>
  );
}

