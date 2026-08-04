const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. MyStair와 함께하며 궁금했던 점들을 다정하게 모아두었어요. -> MyStair와 함께하며 궁금했던 점들을 모아두었어요.
code = code.replace(/MyStair와 함께하며 궁금했던 점들을 다정하게 모아두었어요\./, "MyStair와 함께하며 궁금했던 점들을 모아두었어요.");

// 2. 첫번째 질문 답을 이 질문의 논점을 흐린다 수정해줘
code = code.replace(/a: "MyStair는 특히 특성화고 및 마이스터고 학생들의 깊이 있는 기술 실습과 자격증, 현장 경험 기록에 초점을 맞추어 설계되었습니다\."/, 'a: "이 질문의 논점을 흐린다."');

// 3. 두번째 질문을 AI 자소서 소재는 어떻게 만들어지나요?로 바꿔줘
code = code.replace(/q: "AI 자소서는 어떻게 만들어지나요\?"/, 'q: "AI 자소서 소재는 어떻게 만들어지나요?"');

fs.writeFileSync('src/components/Dashboard.tsx', code);
