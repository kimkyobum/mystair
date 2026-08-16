import fs from 'fs';

function fixPrompt(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // We want to insert the text INSIDE the backticks of systemInstruction
    const ruleStr = `
[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: \${currentDateString} (YYYY-MM-DD 형식: \${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(\${currentDateISO})를 다이어리의 date 필드로 사용해라. 사용자가 기존에 같은 날짜의 일기를 이미 작성했더라도, 추가 일기 작성 요청이라면 똑같이 이 오늘 날짜(\${currentDateISO})를 사용하여 여러 개를 추가할 수 있게 해라. 절대로 과거 날짜나 임의의 미래 날짜를 지어내지 마라!
`;
    
    const target = "수석 컨설턴트 'MyStair AI'야.";
    
    if (content.includes(target) && !content.includes('[현재 시스템 날짜 정보')) {
        content = content.replace(target, target + ruleStr);
        fs.writeFileSync(filepath, content);
        console.log(`Fixed prompt in ${filepath}`);
    } else {
        console.log(`Target string not found or already fixed in ${filepath}`);
    }
}

fixPrompt('server.ts');
fixPrompt('src/components/ChatInterface.tsx');
