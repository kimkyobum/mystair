const fs = require('fs');

function patchServerTs() {
  let content = fs.readFileSync('server.ts', 'utf8');
  
  const replacement = `    const today = new Date();
    const currentDateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
    const currentDateISO = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(today);

    // System instruction embedding portal domain knowledge & smart conversational handling
    const systemInstruction = \`너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.

[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: \${currentDateString} (YYYY-MM-DD 형식: \${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(\${currentDateISO})를 다이어리의 date 필드로 사용해라. 절대로 과거 날짜나 임의의 날짜(예: 2025-05-22 등)를 지어내지 마라!`;
  
  content = content.replace('    // System instruction embedding portal domain knowledge & smart conversational handling\n    const systemInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 \'나만의 기업찾기\' 및 AI 진로·취업 수석 컨설턴트 \'MyStair AI\'야.', replacement);
  fs.writeFileSync('server.ts', content);
}

function patchChatInterface() {
  let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
  
  const replacement = `    const today = new Date();
    const currentDateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const currentDateISO = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const systemInstruction = \`너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.

[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: \${currentDateString} (YYYY-MM-DD 형식: \${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(\${currentDateISO})를 다이어리의 date 필드로 사용해라. 절대로 과거 날짜나 임의의 날짜(예: 2025-05-22 등)를 지어내지 마라!`;
  
  content = content.replace('const systemInstruction = `너는 마이스터고 및 특성화고 학생들을 위한 \'나만의 기업찾기\' 및 AI 진로·취업 수석 컨설턴트 \'MyStair AI\'야.', replacement);
  fs.writeFileSync('src/components/ChatInterface.tsx', content);
}

patchServerTs();
patchChatInterface();
