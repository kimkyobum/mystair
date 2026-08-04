const fs = require('fs');

const filesToPatch = [
    'src/pages/Diary.tsx',
    'src/pages/MBTI.tsx',
    'src/pages/Certificates.tsx',
    'src/pages/Holland.tsx'
];

for (const filepath of filesToPatch) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    if (!content.includes('useTheme')) {
        content = content.replace("import { useLanguage }", "import { useTheme } from '../context/ThemeContext';\nimport { useLanguage }");
    }

    if (!content.includes('const { isLightMode } = useTheme();')) {
        content = content.replace("const { t } = useLanguage();", "const { t } = useLanguage();\n  const { isLightMode } = useTheme();");
    }

    // Diary.tsx
    content = content.replace(
        /className="bg-slate-900\/80 backdrop-blur-md h-\[72px\] w-full flex items-center justify-between px-6 sm:px-10 border-b border-slate-800 sticky top-0 z-40"/g,
        'className={`backdrop-blur-md h-[72px] w-full flex items-center justify-between px-6 sm:px-10 border-b sticky top-0 z-40 ${isLightMode ? "bg-white/80 border-slate-200" : "bg-slate-900/80 border-slate-800"}`}'
    );
    // Diary.tsx Text
    content = content.replace(
        /className="text-white font-black text-\[26px\]/g,
        'className={`${isLightMode ? "text-slate-900" : "text-white"} font-black text-[26px]'
    );

    // MBTI, Certificates, Holland
    content = content.replace(
        /className="bg-\[\#0F172A\]\/80 backdrop-blur-md h-\[72px\] w-full flex items-center justify-start px-10 shadow-\[0_4px_20px_rgba\(15,23,42,0\.15\)\] sticky top-0 z-50 border-b border-white\/5"/g,
        'className={`backdrop-blur-md h-[72px] w-full flex items-center justify-start px-10 shadow-sm sticky top-0 z-50 border-b ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}'
    );
    content = content.replace(
        /className="bg-\[\#0F172A\]\/80 backdrop-blur-md h-\[64px\] sm:h-\[72px\] flex items-center px-4 sm:px-10 sticky top-0 z-50 border-b border-white\/5 shadow-\[0_4px_20px_rgba\(15,23,42,0\.15\)\]"/g,
        'className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center px-4 sm:px-10 sticky top-0 z-50 border-b shadow-sm ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}'
    );
    
    // Back button and title text
    content = content.replace(
        /className="text-white hover:text-indigo-400 transition-colors cursor-pointer mr-6"/g,
        'className={`transition-colors cursor-pointer mr-6 ${isLightMode ? "text-slate-600 hover:text-indigo-600" : "text-white hover:text-indigo-400"}`}'
    );
    content = content.replace(
        /className="text-white font-black text-2xl tracking-tight flex items-center gap-2"/g,
        'className={`font-black text-2xl tracking-tight flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}'
    );
    content = content.replace(
        /className="text-white font-black text-xl sm:text-2xl tracking-tight flex items-center gap-2 sm:gap-3"/g,
        'className={`font-black text-xl sm:text-2xl tracking-tight flex items-center gap-2 sm:gap-3 ${isLightMode ? "text-slate-900" : "text-white"}`}'
    );
    content = content.replace(
        /className="text-white hover:text-indigo-400 transition-colors cursor-pointer mr-4 sm:mr-6"/g,
        'className={`transition-colors cursor-pointer mr-4 sm:mr-6 ${isLightMode ? "text-slate-600 hover:text-indigo-600" : "text-white hover:text-indigo-400"}`}'
    );

    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
}
