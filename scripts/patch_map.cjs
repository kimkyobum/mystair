const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

// We will replace the en translations object with an expanded one
const newEnObj = `{
                'title': 'Meister High Schools',
                'map_title': 'Meister High School Map',
                'loading': 'Rendering 3D map...',
                'info': 'Drag to rotate, scroll to zoom.',
                'search_placeholder': 'Search school, region, field...',
                'count_format': (count) => \`Total \${count} Schools\`,
                'round': 'Round',
                'field': 'Field',
                // Regions
                '서울': 'Seoul', '인천': 'Incheon', '경기': 'Gyeonggi', '강원': 'Gangwon', '충북': 'Chungbuk', '충남': 'Chungnam', '대전': 'Daejeon', '전북': 'Jeonbuk', '전남': 'Jeonnam', '광주': 'Gwangju', '경북': 'Gyeongbuk', '대구': 'Daegu', '울산': 'Ulsan', '부산': 'Busan', '경남': 'Gyeongnam', '세종': 'Sejong', '제주': 'Jeju'
            }`;

html = html.replace(/en:\s*\{[\s\S]*?'field': 'Field'\s*\}/, "en: " + newEnObj);

// Also we need to translate school names and fields inside map.html dynamically
// Let's modify the populateSidebar function and the school info overlay.
// If lang === 'en', use mapTranslations[lang][school.name] || school.name
html = html.replace(/const title = school\.name;/g, "const title = lang === 'en' && window.enNames ? window.enNames[school.name] || school.name : school.name;");
html = html.replace(/const regionText = region;/g, "const regionText = lang === 'en' ? (t[region] || region) : region;");
html = html.replace(/const fieldText = school\.field;/g, "const fieldText = lang === 'en' && window.enFields ? window.enFields[school.field] || school.field : school.field;");
html = html.replace(/const titleText = school\.name;/g, "const titleText = lang === 'en' && window.enNames ? window.enNames[school.name] || school.name : school.name;");

fs.writeFileSync('public/map.html', html);
console.log("Patched map.html");
