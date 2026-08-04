const fs = require('fs');

let mbti = fs.readFileSync('src/data/mbtiData.ts', 'utf8');
let holland = fs.readFileSync('src/data/hollandData.ts', 'utf8');
let lang = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');

const dict = {
  // MBTI Questions
  "주말에는 사람들과 어울리기보다 집에서 쉬는 것이 좋다.": "I prefer relaxing at home over hanging out with people on weekends.",
  "새로운 사람을 만나는 것을 즐기고 먼저 다가가는 편이다.": "I enjoy meeting new people and tend to approach them first.",
  "현실적인 사실이나 경험보다는 상상력과 아이디어에 관심이 많다.": "I am more interested in imagination and ideas than realistic facts or experiences.",
  "일어날 법한 일보다는 실질적으로 일어나는 현실에 더 집중한다.": "I focus more on what is actually happening in reality than what might happen.",
  "결정을 내릴 때 논리와 객관적인 기준을 중요하게 생각한다.": "I consider logic and objective criteria important when making decisions.",
  "다른 사람의 감정이나 상황을 먼저 고려하여 결정하는 편이다.": "I tend to consider others' feelings or situations first when making decisions.",
  "계획을 미리 세우고 일정에 맞게 행동하는 것을 선호한다.": "I prefer making plans in advance and acting according to schedule.",
  "그때그때 상황에 맞게 융통성 있게 대처하는 것을 좋아한다.": "I like responding flexibly to situations as they arise.",
  "다른 사람들의 시선이나 평가에 크게 흔들리지 않는 편이다.": "I am not easily swayed by others' opinions or evaluations.",
  "자신의 행동이나 결정에 대해 자주 되돌아보고 걱정하는 편이다.": "I often reflect on and worry about my actions or decisions.",
  "나는 조용하고 말수가 적은 편이다.": "I am generally quiet and don't talk much.",
  "나는 활발하고 에너지가 넘치는 편이다.": "I am energetic and active.",
  "나는 눈에 보이는 사실 그대로를 믿는 편이다.": "I tend to believe what I can see and facts as they are.",
  "나는 숨겨진 의미나 미래의 가능성을 상상하는 것을 좋아한다.": "I like imagining hidden meanings and future possibilities.",
  "친구가 고민을 이야기할 때 해결책을 먼저 제시하는 편이다.": "I tend to offer solutions first when a friend talks about their worries.",
  "친구가 고민을 이야기할 때 공감해주고 위로해주는 편이다.": "I tend to empathize and comfort when a friend talks about their worries.",
  "일을 시작하기 전에 체계적인 계획을 세우는 것이 마음이 편하다.": "I feel comfortable making systematic plans before starting work.",
  "상황에 따라 유연하게 대처하며 일을 진행하는 것이 좋다.": "I prefer proceeding flexibly depending on the situation.",
  "스트레스를 받아도 비교적 금방 평온을 되찾는 편이다.": "I tend to regain calmness relatively quickly even when stressed.",
  "작은 실수에도 오랫동안 마음이 쓰이고 자책하는 경향이 있다.": "I tend to worry and blame myself for a long time even over small mistakes.",
  
  // MBTI Meta
  "세상의 소금형": "Salt of the Earth", "임금 뒷편의 권력형": "Power Behind the Throne", "예언자형": "Prophet", "과학자형": "Scientist",
  "백과사전형": "Encyclopedia", "성인군자형": "Saint", "잔다르크형": "Joan of Arc", "아이디어 뱅크형": "Idea Bank",
  "수완좋은 활동가형": "Resourceful Activist", "사교적인 외교관형": "Sociable Diplomat", "스파크형": "Spark", "발명가형": "Inventor",
  "사업가형": "Entrepreneur", "친선도모형": "Goodwill Promoter", "언변능숙형": "Skilled Orator", "지도자형": "Leader",
  "책임감이 강하고 현실적이며 철저한 성격": "Responsible, realistic, and thorough",
  "차분하고 헌신적이며 책임감 있는 성격": "Calm, dedicated, and responsible",
  "통찰력 있고 사람들에게 영감을 주는 성격": "Insightful and inspiring",
  "독창적이고 분석적이며 비전을 제시하는 성격": "Original, analytical, and visionary",
  "조용하고 관찰력이 뛰어나며 논리적인 성격": "Quiet, observant, and logical",
  "온화하고 다정하며 현재를 즐기는 성격": "Gentle, friendly, and enjoying the present",
  "이상적이고 성실하며 내적 신념이 깊은 성격": "Idealistic, sincere, and deeply principled",
  "호기심 많고 뛰어난 적응력을 가진 성격": "Curious and highly adaptable",
  "현실적이고 활동적이며 문제 해결에 뛰어난 성격": "Realistic, active, and good at problem-solving",
  "사교적이고 따뜻하며 사람들을 돕는 성격": "Sociable, warm, and helpful",
  "열정적이고 창의적이며 새로운 가능성을 탐구하는 성격": "Passionate, creative, and exploring new possibilities",
  "에너지가 넘치고 지적 도전을 즐기는 성격": "Energetic and enjoying intellectual challenges",
  "현실적이고 실용적이며 지도력이 있는 성격": "Realistic, practical, and leadership-oriented",
  "조화롭고 친절하며 책임감이 강한 성격": "Harmonious, kind, and responsible",
  "카리스마 있고 타인의 성장을 돕는 성격": "Charismatic and helping others grow",
  "결단력 있고 통솔력이 뛰어나며 비전이 있는 성격": "Decisive, commanding, and visionary",

  // MBTI Jobs
  "회계사": "Accountant", "공무원": "Public Official", "데이터 분석가": "Data Analyst",
  "간호사": "Nurse", "유치원 교사": "Kindergarten Teacher", "상담사": "Counselor",
  "심리치료사": "Psychotherapist", "작가": "Writer", "HR 디렉터": "HR Director",
  "시스템 엔지니어": "Systems Engineer", "전략 기획자": "Strategic Planner", "건축가": "Architect",
  "소프트웨어 개발자": "Software Developer", "기계 공학자": "Mechanical Engineer", "파일럿": "Pilot",
  "디자이너": "Designer", "예술가": "Artist", "셰프": "Chef",
  "사회복지사": "Social Worker", "사서": "Librarian", "번역가": "Translator",
  "수학자": "Mathematician", "프로그래머": "Programmer", "경제학자": "Economist",
  "경찰관": "Police Officer", "소방관": "Firefighter", "운동선수": "Athlete",
  "이벤트 플래너": "Event Planner", "승무원": "Flight Attendant", "판매원": "Salesperson",
  "기자": "Journalist", "마케터": "Marketer", "카피라이터": "Copywriter",
  "기업가": "Entrepreneur", "발명가": "Inventor", "투자자": "Investor",
  "경영자": "Manager", "프로젝트 관리자": "Project Manager", "재무 분석가": "Financial Analyst",
  "교사": "Teacher", "인사 담당자": "HR Manager", "홍보 전문가": "PR Expert",
  "정치인": "Politician", "코치": "Coach", "목사": "Pastor",
  "CEO": "CEO", "경영 컨설턴트": "Management Consultant", "변호사": "Lawyer",

  // Holland Questions (I will do a few key prefixes or just skip manual translation if it's too much, but I'll write some code to auto-translate or I can just use placeholder logic or I will provide a full dictionary)
};

// I will append all items in `dict` to koToEnMap in LanguageContext.tsx
let entries = Object.entries(dict).map(([ko, en]) => `  '${ko.replace(/'/g, "\\'")}': '${en.replace(/'/g, "\\'")}',`).join('\n');
lang = lang.replace('const koToEnMap: Record<string, string> = {', 'const koToEnMap: Record<string, string> = {\n' + entries);

fs.writeFileSync('src/friend_site/LanguageContext.tsx', lang);
console.log("Updated LanguageContext.tsx with MBTI");
