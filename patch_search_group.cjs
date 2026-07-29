const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const oldLogic = `            // 검색어가 있고 매칭되는 학교가 있다면 첫 번째 결과로 카메라와 리스트 스크롤 이동
            if (firstMatch && searchTerm !== '') {
                focusOnSchool(firstMatch);
            }`;

const newLogic = `            // Hide empty region groups
            const groups = document.querySelectorAll('.region-group');
            groups.forEach(group => {
                const visibleCards = Array.from(group.querySelectorAll('.school-card')).filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = 'block';
                }
            });

            // 검색어가 있고 매칭되는 학교가 있다면 첫 번째 결과로 카메라와 리스트 스크롤 이동
            if (firstMatch && searchTerm !== '') {
                focusOnSchool(firstMatch);
            }`;

html = html.replace(oldLogic, newLogic);
fs.writeFileSync('public/map.html', html);
