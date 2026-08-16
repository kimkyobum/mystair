const fs = require('fs');

const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    const systemInstruction = \`너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.`;

const replaceStr = `    const today = new Date();
    const currentDateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
    const currentDateISO = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(today);

    // System instruction embedding portal domain knowledge & smart conversational handling
    const systemInstruction = \`너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.

[현재 시스템 날짜 정보 (매우 중요!)]
- 오늘 날짜: \${currentDateString} (YYYY-MM-DD 형식: \${currentDateISO})
- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(\${currentDateISO})를 다이어리의 date 필드로 사용해라. 절대로 과거 날짜나 임의의 날짜(예: 2025-05-22 등)를 지어내지 마라!

사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content);
    console.log("Patched server.ts successfully.");
} else {
    console.log("Failed to find target string in server.ts");
}
