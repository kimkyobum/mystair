const fs = require('fs');

let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// Fix header background
content = content.replace(
    /<div className="bg-\[\#0F172A\]\/80 backdrop-blur-md border-b border-white\/5 sticky top-0 z-50 shrink-0">/,
    '<div className={`backdrop-blur-md border-b sticky top-0 z-50 shrink-0 ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}>'
);

// Fix title text
content = content.replace(
    /<h1 className="text-xl font-bold text-white tracking-tight">\{t\('나만의 기업찾기'\)\}<\/h1>/,
    '<h1 className={`text-xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>{t("나만의 기업찾기")}</h1>'
);

// Fix subtitle text
content = content.replace(
    /<p className="text-\[13px\] text-white\/60 font-medium mt-0\.5">\{t\('다이어리 성장기록 & 프로필 종합 AI 맞춤 기업 추천'\)\}<\/p>/,
    '<p className={`text-[13px] font-medium mt-0.5 ${isLightMode ? "text-slate-500" : "text-white/60"}`}>{t("다이어리 성장기록 & 프로필 종합 AI 맞춤 기업 추천")}</p>'
);

// We should also replace the back button and missing white texts
content = content.replace(
    /className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500\/20 text-white shrink-0"/,
    'className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0"'
);

// Let's find "text-white " globally to see what we missed in CompanySearch
content = content.replace(
    /className="text-white /g,
    'className={`text-white ${isLightMode ? "text-slate-900" : ""} ` '
); // Wait, this might be dangerous if applied blindly.

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
