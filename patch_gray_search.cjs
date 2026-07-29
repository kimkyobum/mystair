const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

// 1. Update Map Element Color to distinct Gray
const newMaterialCode = `
            // 명확한 회색 톤의 메테리얼 느낌 (너무 밝지 않게 조정)
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x6b7280,       // 짙은 회색 (Gray 500)
                emissive: 0x1f2937,    // 어두운 회색 발광 (Gray 800) - 너무 하얗게 뜨지 않도록 제어
                roughness: 0.4,
                metalness: 0.3,
                clearcoat: 0.3,        // 코팅 반사를 줄여서 흰색 빛 반사 억제
                clearcoatRoughness: 0.3,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });
`;
html = html.replace(/\/\/\s*회색 톤의 메테리얼 느낌[\s\S]*?const material = new THREE\.MeshPhysicalMaterial\(\{[\s\S]*?\}\);/, newMaterialCode);

// 2. Update Search Logic to Scroll and Focus
const newSearchLogic = `
        // 검색 필터링 및 포커스 이동 기능
        document.getElementById('school-search').addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim().toLowerCase();
            const cards = document.querySelectorAll('.school-card');
            let visibleCount = 0;
            let firstMatch = null;
            
            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const badge = card.querySelector('.region-badge').textContent.toLowerCase();
                const field = card.querySelector('.field-info span:last-child').textContent.toLowerCase();
                
                if (searchTerm === '') {
                    card.style.display = 'flex';
                    visibleCount++;
                } else if(name.includes(searchTerm) || badge.includes(searchTerm) || field.includes(searchTerm)) {
                    card.style.display = 'flex';
                    visibleCount++;
                    
                    if (!firstMatch) {
                        // find original school object from meisterSchools array
                        firstMatch = meisterSchools.find(s => name.includes(s.name.toLowerCase()));
                    }
                } else {
                    card.style.display = 'none';
                }
            });
            
            document.getElementById('school-count').textContent = '총 ' + visibleCount + '개교 목록';
            
            // 검색어가 있고 매칭되는 학교가 있다면 첫 번째 결과로 카메라와 리스트 스크롤 이동
            if (firstMatch && searchTerm !== '') {
                focusOnSchool(firstMatch);
            }
        });

        // 8. 데이터 로드 및 렌더링 시작`;
html = html.replace(/\/\/\s*검색 필터링 기능[\s\S]*?\/\/\s*8\. 데이터 로드 및 렌더링 시작/, newSearchLogic);

fs.writeFileSync('public/map.html', html);
