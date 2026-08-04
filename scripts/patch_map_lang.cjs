const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const langScript = `
    <!-- Language Support -->
    <script>
        const mapTranslations = {
            ko: {
                'title': '전국 마이스터고',
                'map_title': '전국 마이스터고 지도',
                'loading': '전국 마이스터고 3D 지도를 렌더링하고 있습니다...',
                'info': '마우스를 드래그하여 지도를 회전하거나 스크롤하여 확대/축소할 수 있습니다.',
                'search_placeholder': '학교명, 지역, 분야 검색...',
                'count_format': (count) => \`총 \${count}개교 목록\`,
                'round': '차',
                'field': '분야'
            },
            en: {
                'title': 'Meister High Schools',
                'map_title': 'Meister High School Map',
                'loading': 'Rendering 3D map...',
                'info': 'Drag to rotate, scroll to zoom.',
                'search_placeholder': 'Search school, region, field...',
                'count_format': (count) => \`Total \${count} Schools\`,
                'round': 'Round',
                'field': 'Field'
            }
        };

        const regionMap = {
            '서울': 'Seoul', '인천': 'Incheon', '부산': 'Busan', '대구': 'Daegu',
            '광주': 'Gwangju', '대전': 'Daejeon', '울산': 'Ulsan', '세종': 'Sejong',
            '경기': 'Gyeonggi', '강원': 'Gangwon', '충북': 'Chungbuk', '충남': 'Chungnam',
            '전북': 'Jeonbuk', '전남': 'Jeonnam', '경북': 'Gyeongbuk', '경남': 'Gyeongnam',
            '제주': 'Jeju'
        };

        function getCurrentLanguage() {
            return localStorage.getItem('language') === 'en' ? 'en' : 'ko';
        }

        function updateTexts() {
            const lang = getCurrentLanguage();
            const t = mapTranslations[lang];

            document.querySelector('.sidebar-header h2').textContent = t.title;
            document.querySelector('#title-overlay h1').textContent = t.map_title;
            document.querySelector('#loading div:nth-child(2)').textContent = t.loading;
            document.querySelector('#info').textContent = t.info;
            document.querySelector('#school-search').placeholder = t.search_placeholder;

            // Trigger search to update count text
            const searchInput = document.getElementById('school-search');
            searchInput.dispatchEvent(new Event('input'));
            
            // Re-render school cards if they exist
            if (document.querySelectorAll('.school-card').length > 0) {
                renderSchoolList();
            }
        }

        // Listen for language changes from React app
        window.addEventListener('storage', (e) => {
            if (e.key === 'language') {
                updateTexts();
            }
        });
        window.addEventListener('languageChanged', updateTexts);
        
        // Also observe for manual polling in case events are missed cross-iframe
        let lastLang = getCurrentLanguage();
        setInterval(() => {
            if(getCurrentLanguage() !== lastLang) {
                lastLang = getCurrentLanguage();
                updateTexts();
            }
        }, 500);

    </script>
`;

html = html.replace(/<script>/, langScript + "\n    <script>");

// Modify search filtering logic to use translated count string
const newSearchLogic = `
            const lang = getCurrentLanguage();
            const t = mapTranslations[lang];
            document.getElementById('school-count').textContent = t.count_format(visibleCount);
`;
html = html.replace(/document\.getElementById\('school-count'\)\.textContent = '총 ' \+ visibleCount \+ '개교 목록';/, newSearchLogic);

// Modify renderSchoolList to support translation
const renderSchoolList = `
        function renderSchoolList() {
            const list = document.getElementById('school-list');
            list.innerHTML = '';
            const lang = getCurrentLanguage();
            const t = mapTranslations[lang];
            
            meisterSchools.forEach((school, index) => {
                const card = document.createElement('div');
                card.className = 'school-card';
                card.id = 'school-card-' + index;
                
                const regionText = lang === 'en' ? (regionMap[school.region] || school.region) : school.region;
                const roundText = lang === 'en' ? \`\${school.round} \${t.round}\` : \`\${school.round}\${t.round}\`;
                
                card.innerHTML = \`
                    <div class="school-header">
                        <h3>\${school.name}</h3>
                        <span class="region-badge">\${regionText}</span>
                    </div>
                    <div class="field-info">
                        <span>\${t.field}</span>
                        <span>\${school.field}</span>
                    </div>
                    <div class="round-info">\${roundText}</div>
                \`;
                
                card.addEventListener('click', () => {
                    focusOnSchool(school);
                    const prevActive = document.querySelector('.active-card');
                    if(prevActive) prevActive.classList.remove('active-card');
                    card.classList.add('active-card');
                });
                
                list.appendChild(card);
            });
        }
`;
// Replace the existing renderSchoolList function
html = html.replace(/function renderSchoolList\(\) \{[\s\S]*?list\.appendChild\(card\);\n\s*\}\n\s*\}/, renderSchoolList);

fs.writeFileSync('public/map.html', html);
