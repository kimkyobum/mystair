const fs = require('fs');

const files = [
    'src/pages/MBTI.tsx',
    'src/pages/Certificates.tsx',
    'src/pages/Holland.tsx',
    'src/pages/Diary.tsx',
    'src/pages/MyPage.tsx',
];

for (const filepath of files) {
    if (!fs.existsSync(filepath)) continue;
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // In MBTI.tsx and others:
    // className={`font-black text-[26px] ${isLightMode ? "text-slate-900" : "text-white"}`} tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity">
    content = content.replace(
        /className=\{`font-black text-\[26px\] \$\{isLightMode \? "text-slate-900" : "text-white"\}`\} tracking-\[-0\.5px\] cursor-pointer hover:opacity-80 transition-opacity">/g,
        'className={`font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity ${isLightMode ? "text-slate-900" : "text-white"}`}>'
    );
    
    content = content.replace(
        /className=\{`\$\{isLightMode \? "text-slate-900" : "text-white"\} font-black text-\[26px\]` tracking-\[-0\.5px\] cursor-pointer hover:opacity-80 transition-opacity/g,
        'className={`font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity ${isLightMode ? "text-slate-900" : "text-white"}`}'
    );

    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
}
