const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newPopulateSidebar = `
        function populateSidebar() {
            const listContainer = document.getElementById('school-list');
            listContainer.innerHTML = '';
            
            const lang = getCurrentLanguage();
            const t = mapTranslations[lang];
            
            // 제목 갯수 동적 업데이트
            document.getElementById('school-count').innerText = t.count_format(meisterSchools.length);

            // 1. 지역별로 데이터 그룹화
            const groupedSchools = {};
            meisterSchools.forEach(school => {
                if (!groupedSchools[school.region]) {
                    groupedSchools[school.region] = [];
                }
                groupedSchools[school.region].push(school);
            });

            // 2. 지역별 노출 순서 지정
            const regionOrder = ['서울', '인천', '경기', '강원', '충북', '충남', '대전', '전북', '전남', '광주', '경북', '대구', '울산', '부산', '경남', '세종', '제주'];
            
            const regions = Object.keys(groupedSchools).sort((a, b) => {
                let indexA = regionOrder.indexOf(a);
                let indexB = regionOrder.indexOf(b);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });

            // 3. 그룹화된 데이터 순회하며 렌더링
            regions.forEach(region => {
                const schoolsInRegion = groupedSchools[region];
                
                const groupDiv = document.createElement('div');
                groupDiv.className = 'region-group';
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'region-header';
                
                const regionText = lang === 'en' ? (regionMap[region] || region) : region;
                
                headerDiv.innerHTML = \`<span class="region-badge bg-\${region}">\${regionText}</span> <span style="font-size:12px; color:#94a3b8; font-weight:400; margin-left:6px;">\${schoolsInRegion.length}\${lang === 'en' ? '' : '개'}</span>\`;
                groupDiv.appendChild(headerDiv);

                // 해당 지역의 학교 카드들
                schoolsInRegion.forEach(school => {
                    const card = document.createElement('div');
                    card.className = 'school-card';
                    card.id = \`card-\${school.name}\`;
                    card.style.marginBottom = '10px';
                    
                    const fieldText = school.field;
                    // You could add a field dictionary for full English translations, but let's leave it as is or handle common ones if needed
                    
                    card.innerHTML = \`
                        <div class="card-header">
                            <span class="region-badge bg-\${school.region}">\${regionText}</span>
                            <span class="card-field">\${fieldText}</span>
                        </div>
                        <div class="card-name">\${school.name}</div>
                    \`;

                    // 리스트 클릭 시 지도 카메라 이동
                    card.onclick = () => focusOnSchool(school);
                    
                    groupDiv.appendChild(card);
                });
                
                listContainer.appendChild(groupDiv);
            });
        }
`;

html = html.replace(/function populateSidebar\(\) \{[\s\S]*?listContainer\.appendChild\(groupDiv\);\n\s*\}\);\n\s*\}/, newPopulateSidebar);
fs.writeFileSync('public/map.html', html);
