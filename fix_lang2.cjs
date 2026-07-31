const fs = require('fs');
let lines = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8').split('\n');

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes("' /> 주요 사업/제품") || line.includes("' /> 조직 문화") || line.includes("' /> 핵심 역량 및 가치") || line.includes("' /> 연봉 & 복리후생") || line.includes("' /> 근무 & 채용절차") || line.includes("' /> 커리어 패스") || line.includes("'>원하시는 정보 카테고리를 선택해주세요</h3>") || line.includes("' /> 주요 사업 및 제품") || line.includes("' /> 조직 문화 및 근무 분위기")) {
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
