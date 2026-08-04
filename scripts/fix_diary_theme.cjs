const fs = require('fs');
let content = fs.readFileSync('src/pages/Diary.tsx', 'utf-8');
content = content.replace(
    /const { t, language } = useLanguage\(\);/g,
    'const { t, language } = useLanguage();\n  const { isLightMode } = useTheme();'
);
fs.writeFileSync('src/pages/Diary.tsx', content);
