const fs = require('fs');

let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// 1. Add useTheme import and hook
if (!content.includes('useTheme')) {
    content = content.replace(
        "import { useLanguage }",
        "import { useTheme } from '../context/ThemeContext';\nimport { useLanguage }"
    );
}

if (!content.includes('const { isLightMode } = useTheme();')) {
    content = content.replace(
        "const { t } = useLanguage();",
        "const { t } = useLanguage();\n  const { isLightMode } = useTheme();"
    );
}

// 2. Replace hardcoded dark mode colors
// "bg-[#0F172A]" -> `${isLightMode ? "bg-white" : "bg-[#0F172A]"}`
content = content.replace(
    /className="min-h-screen bg-\[\#0F172A\] text-white font-sans selection:bg-purple-500\/30"/g,
    'className={`min-h-screen font-sans selection:bg-purple-500/30 ${isLightMode ? "bg-white text-slate-900" : "bg-[#0F172A] text-white"}`}'
);

content = content.replace(
    /className="bg-\[\#0F172A\]\/80 backdrop-blur-md h-\[72px\] w-full flex items-center justify-start px-10 shadow-\[0_4px_20px_rgba\(15,23,42,0\.15\)\] sticky top-0 z-50 border-b border-white\/5"/g,
    'className={`backdrop-blur-md h-[72px] w-full flex items-center justify-start px-10 shadow-sm sticky top-0 z-50 border-b ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}'
);

// Container for empty state
content = content.replace(
    /className="w-full max-w-2xl bg-white\/5 backdrop-blur-md rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white\/10 shadow-xl"/g,
    'className={`w-full max-w-2xl backdrop-blur-md rounded-3xl p-10 flex flex-col items-center justify-center text-center border shadow-xl ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/10"}`}'
);

content = content.replace(
    /className="text-white\/60 text-lg mb-8 leading-relaxed max-w-lg"/g,
    'className={`text-lg mb-8 leading-relaxed max-w-lg ${isLightMode ? "text-slate-600" : "text-white/60"}`}'
);

content = content.replace(
    /className="w-full max-w-7xl mx-auto space-y-12"/g,
    'className="w-full max-w-7xl mx-auto space-y-12"'
);

// Title text
content = content.replace(
    /className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white\/70 tracking-tight"/g,
    'className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text tracking-tight ${isLightMode ? "bg-gradient-to-r from-slate-900 to-slate-600" : "bg-gradient-to-r from-white to-white/70"}`}'
);

// Card for company item
content = content.replace(
    /className="group bg-white\/5 border border-white\/10 rounded-3xl p-6 md:p-8 hover:bg-white\/10 hover:border-indigo-500\/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500\/20 flex flex-col h-full"/g,
    'className={`group rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-pointer shadow-lg flex flex-col h-full border ${isLightMode ? "bg-white border-slate-200 hover:border-indigo-500/50 hover:shadow-indigo-500/20" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-indigo-500/20"}`}'
);

// Modal container
content = content.replace(
    /className="absolute inset-0 bg-\[\#0F172A\]\/85 backdrop-blur-md"/g,
    'className={`absolute inset-0 backdrop-blur-md ${isLightMode ? "bg-white/85" : "bg-[#0F172A]/85"}`}'
);

content = content.replace(
    /className="relative w-full max-w-3xl max-h-\[90vh\] overflow-y-auto no-scrollbar bg-\[\#111827\] border border-white\/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col z-10"/g,
    'className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col z-10 border ${isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-[#111827] border-white/10 text-white"}`}'
);

content = content.replace(
    /className="absolute top-6 right-6 p-2 rounded-full bg-white\/5 text-white\/50 hover:bg-white\/10 hover:text-white transition-colors z-10 cursor-pointer"/g,
    'className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-10 cursor-pointer ${isLightMode ? "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}'
);

content = content.replace(
    /className="flex flex-col md:flex-row items-start justify-between mb-6 pb-6 border-b border-white\/10 gap-6 pr-12"/g,
    'className={`flex flex-col md:flex-row items-start justify-between mb-6 pb-6 border-b gap-6 pr-12 ${isLightMode ? "border-slate-200" : "border-white/10"}`}'
);

content = content.replace(
    /className="text-white\/50 text-\[13px\] font-medium tracking-wide"/g,
    'className={`text-[13px] font-medium tracking-wide ${isLightMode ? "text-slate-500" : "text-white/50"}`}'
);

content = content.replace(
    /className="text-3xl md:text-4xl font-bold text-white tracking-tight"/g,
    'className={`text-3xl md:text-4xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}'
);

content = content.replace(
    /className="flex flex-wrap gap-2\.5 pb-6 mb-6 border-b border-white\/10"/g,
    'className={`flex flex-wrap gap-2.5 pb-6 mb-6 border-b ${isLightMode ? "border-slate-200" : "border-white/10"}`}'
);

// Tab buttons 
content = content.replace(
    /'bg-white\/5 text-white\/70 hover:bg-white\/10 hover:text-white'/g,
    'isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"'
);

// Content area
content = content.replace(
    /className="flex-1 bg-white\/5 rounded-2xl p-6 md:p-8 border border-white\/5 min-h-\[240px\] max-h-\[420px\] overflow-y-auto flex flex-col justify-between"/g,
    'className={`flex-1 rounded-2xl p-6 md:p-8 border min-h-[240px] max-h-[420px] overflow-y-auto flex flex-col justify-between ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/5"}`}'
);

content = content.replace(
    /className="text-lg font-bold text-white mb-2"/g,
    'className={`text-lg font-bold mb-2 ${isLightMode ? "text-slate-900" : "text-white"}`}'
);

content = content.replace(
    /className="text-white\/60 text-sm max-w-md"/g,
    'className={`text-sm max-w-md ${isLightMode ? "text-slate-500" : "text-white/60"}`}'
);

content = content.replace(
    /className="text-lg font-bold text-white mb-4 flex items-center gap-2"/g,
    'className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}'
);

content = content.replace(
    /className="text-white\/80 leading-relaxed text-base"/g,
    'className={`leading-relaxed text-base ${isLightMode ? "text-slate-700" : "text-white/80"}`}'
);

content = content.replace(
    /className="text-white\/80 leading-relaxed text-base mb-4"/g,
    'className={`leading-relaxed text-base mb-4 ${isLightMode ? "text-slate-700" : "text-white/80"}`}'
);

content = content.replace(
    /className="bg-black\/20 p-4 rounded-xl border border-white\/5"/g,
    'className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}'
);

content = content.replace(
    /className="text-white\/90 text-sm leading-relaxed"/g,
    'className={`text-sm leading-relaxed ${isLightMode ? "text-slate-800" : "text-white/90"}`}'
);

content = content.replace(
    /className="text-white\/80 leading-relaxed text-base whitespace-pre-wrap"/g,
    'className={`leading-relaxed text-base whitespace-pre-wrap ${isLightMode ? "text-slate-700" : "text-white/80"}`}'
);

content = content.replace(
    /className="bg-black\/20 p-4 rounded-xl border border-white\/5 mb-4"/g,
    'className={`p-4 rounded-xl border mb-4 ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}'
);

content = content.replace(
    /className="text-white\/90 leading-relaxed text-sm whitespace-pre-wrap"/g,
    'className={`leading-relaxed text-sm whitespace-pre-wrap ${isLightMode ? "text-slate-800" : "text-white/90"}`}'
);


fs.writeFileSync('src/pages/CompanySearch.tsx', content);
