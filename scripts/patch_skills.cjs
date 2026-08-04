const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldSkills = `const skills = [
  "PLC", "CAD", "회로 설계", "트러블슈팅", "C/C++", "Python", "네트워크", "설비보전", "자동제어", "전기기능사", "정보처리"
];`;

const newSkills = `const skills = [
  "진로", "마이스터", "다이어리", "자격증", "직무검사", "기능사"
];`;

code = code.replace(oldSkills, newSkills);

fs.writeFileSync('src/components/Dashboard.tsx', code);
