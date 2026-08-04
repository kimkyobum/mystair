const fs = require('fs');

let content = fs.readFileSync('src/pages/MyPage.tsx', 'utf-8');

// Replace the Background Selection section in MyPage.tsx
// Currently it has:
// <div className={`flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 transition-opacity ${isLightMode ? 'opacity-50 pointer-events-none' : ''}`}>
// ...
// We can just remove the solid black option.

content = content.replace(
    /<button\s*onClick=\{\(\) => setBackgroundType\('none'\)\}\s*className=\{`flex-1 py-2 rounded-lg text-xs font-bold transition-all border \$\{\s*backgroundType === 'none'\s*\?\s*'bg-slate-900 text-white border-slate-900 shadow-sm'\s*:\s*'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'\s*\}`\}\s*>\s*\{t\('단색 \(검정\)'\)\}\s*<\/button>/g,
    ''
);

// We should also replace the whole backgroundType selection to look like it only has Light and Dark (Space). 
// Wait, actually, the user wants "Light Mode" and "Space Mode" as the two main choices, maybe we can simplify it.
// Right now there's Light/Dark mode buttons AND backgroundType buttons.
// The user says "라이트랑 우주만 만들어줘"
// Let's replace the whole Box 8 contents.

fs.writeFileSync('src/pages/MyPage.tsx', content);
