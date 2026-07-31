const fs = require('fs');
let lines = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8').split('\n');

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes("'>💡 현직자 리뷰 / 특징 요약</span>") || line.includes("' /> 우대 전공") || line.includes("' /> 우대 자격증") || line.includes("' /> 채용 절차") || line.includes("' /> 커리어 비전")) {
        skip = true;
    }
    
    if (skip) {
        if (line.includes("',") || line.includes("', ")) {
            skip = false;
        }
        continue;
    }
    
    newLines.push(line);
}

fs.writeFileSync('src/friend_site/LanguageContext.tsx', newLines.join('\n'));
console.log("Fixed lines!");
