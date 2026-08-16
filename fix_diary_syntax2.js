import fs from 'fs';

let content = fs.readFileSync('src/pages/Diary.tsx', 'utf8');

content = content.replace(/\)\)\}\}/g, "))}");

fs.writeFileSync('src/pages/Diary.tsx', content);
console.log("Fixed syntax 2");
