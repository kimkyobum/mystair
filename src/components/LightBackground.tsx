export default function LightBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-slate-50">
      {/* 1. Base subtle emerald-slate background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30" />

      {/* 2. Soft Cloud-like Organic Gradient Blends */}
      <div className="absolute -top-[10%] left-[5%] w-[70vw] h-[55vh] bg-gradient-to-r from-emerald-100/35 via-teal-100/30 to-emerald-200/25 rounded-[100%] blur-[120px] animate-float-slow" />
      
      <div 
        className="absolute top-[25%] -right-[10%] w-[65vw] h-[60vh] bg-gradient-to-l from-teal-100/30 via-emerald-100/35 to-teal-200/25 rounded-[100%] blur-[130px] animate-pulse-glow" 
      />

      <div 
        className="absolute -bottom-[10%] left-[15%] w-[75vw] h-[50vh] bg-gradient-to-t from-emerald-100/35 via-teal-100/30 to-slate-100/25 rounded-[100%] blur-[140px] animate-float-slow" 
        style={{ animationDelay: '-7s' }} 
      />
    </div>
  );
}

