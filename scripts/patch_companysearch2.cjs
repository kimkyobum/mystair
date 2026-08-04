const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

content = content.replace(
    /className="text-md font-bold text-white mb-3 flex items-center gap-2"/g,
    'className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}'
);

content = content.replace(
    /className="text-white\/70 text-sm font-medium mb-1"/g,
    'className={`text-sm font-medium mb-1 ${isLightMode ? "text-slate-500" : "text-white/70"}`}'
);

content = content.replace(
    /className="text-white font-bold leading-relaxed"/g,
    'className={`font-bold leading-relaxed ${isLightMode ? "text-slate-800" : "text-white"}`}'
);

content = content.replace(
    /className="text-white font-semibold flex items-center gap-2"/g,
    'className={`font-semibold flex items-center gap-2 ${isLightMode ? "text-slate-800" : "text-white"}`}'
);

content = content.replace(
    /className="text-white leading-relaxed text-sm"/g,
    'className={`leading-relaxed text-sm ${isLightMode ? "text-slate-800" : "text-white"}`}'
);

content = content.replace(
    /className="bg-black\/30 border border-white\/5 rounded-2xl p-6 mt-6"/g,
    'className={`rounded-2xl p-6 mt-6 border ${isLightMode ? "bg-indigo-50 border-indigo-100" : "bg-black/30 border-white/5"}`}'
);

content = content.replace(
    /className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2"/g,
    'className={`text-lg font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-indigo-600" : "text-indigo-300"}`}'
);

content = content.replace(
    /className="text-white\/90 leading-relaxed text-base"/g,
    'className={`leading-relaxed text-base ${isLightMode ? "text-slate-700" : "text-white/90"}`}'
);

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
