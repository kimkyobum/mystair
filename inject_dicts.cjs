const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const enNames = {
    '수도전기공업고': 'Sudo Electric Technical High', '미림마이스터고': 'Mirim Meister High', '서울로봇고': 'Seoul Robot High', '서울도시과학기술고': 'Seoul Urban Science Tech High',
    '인천전자마이스터고': 'Incheon Electronic Meister High', '인천해사고': 'Incheon Maritime High', '수원하이텍고': 'Suwon Hi-tech High', '평택마이스터고': 'Pyeongtaek Meister High', '경기게임마이스터고': 'Gyeonggi Game Meister High',
    '원주의료고': 'Wonju Medical High', '한국에너지마이스터고': 'Korea Energy Meister High', '한국소방마이스터고': 'Korea Fire Meister High',
    '충북반도체고': 'Chungbuk Semiconductor High', '한국바이오마이스터고': 'Korea Bio Meister High', '충북에너지고': 'Chungbuk Energy High',
    '합덕제철고': 'Hapdeok Steel High', '공주마이스터고': 'Gongju Meister High', '연무마이스터고': 'Yeonmu Meister High', '한국식품마이스터고': 'Korea Food Meister High', '충남반도체마이스터고': 'Chungnam Semiconductor Meister High', '아산스마트팩토리마이스터고': 'Asan Smart Factory Meister High',
    '동아마이스터고': 'Donga Meister High', '대덕소프트웨어마이스터고': 'Daedeok SW Meister High',
    '군산기계공업고': 'Gunsan Mechanical High', '전북기계공업고': 'Jeonbuk Mechanical High', '김제농생명마이스터고': 'Gimje Agri-Life Meister High',
    '한국경마축산고': 'Korea Horse Racing & Animal Husbandry High', '한국항만물류고': 'Korea Port Logistics High', '전남생명과학고': 'Jeonnam Life Science High', '여수석유화학고': 'Yeosu Petrochemical High', '완도수산고': 'Wando Fisheries High',
    '광주자동화설비마이스터고': 'Gwangju Automation Meister High', '광주소프트웨어마이스터고': 'Gwangju SW Meister High',
    '구미전자공업고': 'Gumi Electronic Technical High', '금오공업고': 'Geumo Technical High', '포항제철공업고': 'Pohang Steel Technical High', '한국원자력마이스터고': 'Korea Nuclear Meister High', '한국국제통상마이스터고': 'Korea International Trade Meister High', '경북바이오마이스터고': 'Gyeongbuk Bio Meister High', '경북소프트웨어마이스터고': 'Gyeongbuk SW Meister High',
    '경북기계공업고': 'Gyeongbuk Mechanical High', '대구일마이스터고': 'Daegu Il Meister High', '대구소프트웨어마이스터고': 'Daegu SW Meister High', '대구농업마이스터고': 'Daegu Agricultural Meister High', '대구반도체마이스터고': 'Daegu Semiconductor Meister High',
    '울산마이스터고': 'Ulsan Meister High', '현대공업고': 'Hyundai Technical High', '울산에너지고': 'Ulsan Energy High',
    '부산기계공업고': 'Busan Mechanical High', '부산해사고': 'Busan Maritime High', '부산자동차마이스터고': 'Busan Auto Meister High', '부산소프트웨어마이스터고': 'Busan SW Meister High',
    '거제공업고': 'Geoje Technical High', '삼천포공업고': 'Samcheonpo Technical High', '공군항공과학고': 'Air Force Aviation Science High', '한국나노마이스터고': 'Korea Nano Meister High',
    '한국해양마이스터고': 'Korea Maritime Meister High', '한국반도체마이스터고등학교': 'Korea Semiconductor Meister High'
};

const enFields = {
    '에너지': 'Energy', '뉴미디어콘텐츠': 'New Media Content', '로봇': 'Robotics', '해외건설·플랜트': 'Overseas Construction & Plant',
    '전자·통신': 'Electronics & Communication', '해양': 'Maritime', '메카트로닉스': 'Mechatronics', '자동차·기계': 'Auto & Mechanical', '게임콘텐츠': 'Game Contents',
    '의료기기·바이오': 'Medical Device & Bio', '발전산업': 'Power Generation Industry', '소방': 'Firefighting',
    '반도체장비': 'Semiconductor Equipment', '바이오': 'Bio', '차세대전지': 'Next-gen Battery',
    '철강': 'Steel', 'SMT장비/전기·전자': 'SMT/Electricity & Electronics', '자동차부품제조': 'Auto Parts Manufacturing', '식품': 'Food', '스마트팩토리': 'Smart Factory', '전기전자/기계': 'Electricity, Electronics & Mechanical',
    '기계': 'Mechanical', '소프트웨어': 'Software', '농생명': 'Agricultural Life',
    '말산업': 'Horse Industry', '항만물류': 'Port Logistics', '친환경농축산': 'Eco-friendly Agriculture & Livestock', '석유화학': 'Petrochemical', '수산': 'Fisheries',
    '자동화설비': 'Automation Facility', 
    '전자': 'Electronics', '정밀기계': 'Precision Mechanical', '원자력': 'Nuclear', '국제무역': 'International Trade',
    '스마트농업': 'Smart Agriculture', '반도체': 'Semiconductor',
    '조선플랜트': 'Shipbuilding Plant', '자동차': 'Automotive',
    '조선': 'Shipbuilding', '항공': 'Aviation', '나노': 'Nano'
};

html = html.replace('<script>', `<script>
window.enNames = ${JSON.stringify(enNames)};
window.enFields = ${JSON.stringify(enFields)};
`);

fs.writeFileSync('public/map.html', html);
console.log("Injected dicts to map.html");
