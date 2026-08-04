const fs = require('fs');

let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

const regexes = [
    // Empty/Loading State
    [/className="text-white\/60 font-medium text-lg"/g, 'className={`font-medium text-lg ${isLightMode ? "text-slate-500" : "text-white/60"}` }'],
    [/className="text-2xl font-bold text-white mb-4"/g, 'className={`text-2xl font-bold mb-4 ${isLightMode ? "text-slate-900" : "text-white"}` }'],
    [/className="text-white\/60 text-lg mb-8 max-w-md leading-relaxed"/g, 'className={`text-lg mb-8 max-w-md leading-relaxed ${isLightMode ? "text-slate-500" : "text-white/60"}` }'],
    
    // Top 10 Headers
    [/className="text-2xl font-bold text-white tracking-tight mb-2"/g, 'className={`text-2xl font-bold tracking-tight mb-2 ${isLightMode ? "text-slate-900" : "text-white"}` }'],
    [/className="text-white\/50 text-sm"/g, 'className={`text-sm ${isLightMode ? "text-slate-500" : "text-white/50"}` }'],
    
    // Company Cards
    [/className="flex items-center justify-between p-5 rounded-2xl bg-white\/5 border border-white\/5 hover:bg-white\/10 hover:border-white\/20 transition-all duration-200 text-left group cursor-pointer"/g, 
     'className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left group cursor-pointer ${isLightMode ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}` }'],
     
    [/className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors"/g, 'className={`font-semibold text-lg transition-colors ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}` }'],
    [/className="font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors"/g, 'className={`font-semibold text-lg transition-colors ${isLightMode ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-emerald-300"}` }'],
    
    [/className="text-white\/60 text-xs mt-1 truncate max-w-md sm:max-w-xl"/g, 'className={`text-xs mt-1 truncate max-w-md sm:max-w-xl ${isLightMode ? "text-slate-500" : "text-white/60"}` }'],
    
    // Chevron Right Button
    [/className="p-2 rounded-xl bg-white\/5 hover:bg-white\/10 text-white\/40 hover:text-white transition-colors cursor-pointer"/g,
     'className={`p-2 rounded-xl transition-colors cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"}` }'],
     
    // Sub-modal classes (Other companies)
    [/className="text-2xl md:text-3xl font-bold text-white tracking-tight"/g, 'className={`text-2xl md:text-3xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}` }'],
    [/className="text-white\/50 text-xs sm:text-sm mt-1"/g, 'className={`text-xs sm:text-sm mt-1 ${isLightMode ? "text-slate-500" : "text-white/50"}` }'],
    [/className="absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-white\/40"/g, 'className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLightMode ? "text-slate-400" : "text-white/40"}` }'],
    [/className="w-full pl-10 pr-4 py-2\.5 bg-white\/5 border border-white\/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-white\/30"/g, 'className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors ${isLightMode ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400" : "bg-white/5 border-white/10 text-white placeholder-white/30"}` }'],
    
    [/className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors"/g, 'className={`font-semibold text-base transition-colors ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}` }'],
    [/className="text-white\/50 text-xs mt-0\.5 truncate max-w-lg"/g, 'className={`text-xs mt-0.5 truncate max-w-lg ${isLightMode ? "text-slate-500" : "text-white/50"}` }'],
    [/className="p-1\.5 rounded-lg bg-white\/5 hover:bg-white\/10 text-white\/40 hover:text-white transition-colors cursor-pointer"/g, 'className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"}` }'],
    [/className="py-12 text-center text-white\/40 text-sm"/g, 'className={`py-12 text-center text-sm ${isLightMode ? "text-slate-400" : "text-white/40"}` }'],
    
    // Top Profile Button
    [/className="px-4 py-2 bg-white\/10 hover:bg-white\/20 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 border border-white\/5 hover:border-white\/10"/g, 'className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 border ${isLightMode ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm" : "bg-white/10 hover:bg-white/20 text-white border-white/5 hover:border-white/10"}` }']
];

for (const [regex, replacement] of regexes) {
    content = content.replace(regex, replacement);
}

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
