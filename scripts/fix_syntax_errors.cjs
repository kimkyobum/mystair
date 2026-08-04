const fs = require('fs');

const files = [
    'src/pages/Diary.tsx',
    'src/pages/MBTI.tsx',
    'src/pages/Certificates.tsx',
    'src/pages/Holland.tsx'
];

for (const filepath of files) {
    if (!fs.existsSync(filepath)) continue;
    let content = fs.readFileSync(filepath, 'utf-8');
    
    content = content.replace(
        /className="`\$\{isLightMode/g,
        'className={`\$\{isLightMode'
    );
    content = content.replace(
        /className=\{`\$\{isLightMode \? "text-slate-900" : "text-white"\} font-black text-\[26px\]/g,
        'className={`font-black text-[26px] ${isLightMode ? "text-slate-900" : "text-white"}`}'
    );
    
    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
}
