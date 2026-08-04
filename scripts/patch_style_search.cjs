const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

// Update typography styles
const oldTitleOverlayCss = `.title-overlay h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 500;
            letter-spacing: 0.2em;
            color: #ffffff;
        }`;

html = html.replace(/#title-overlay h1 \{[\s\S]*?\}/, `#title-overlay h1 {
            margin: 0;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #ffffff;
            text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }`);

html = html.replace(/\.sidebar-header h2 \{[\s\S]*?\}/, `.sidebar-header h2 {
            margin: 0 0 12px 0;
            font-size: 28px;
            color: #ffffff;
            font-weight: 800;
            letter-spacing: -0.03em;
        }`);

// Add Search Input styles
const searchStyle = `
        .search-container {
            margin-top: 20px;
            position: relative;
        }
        .search-input {
            width: 100%;
            padding: 12px 16px 12px 40px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: #ffffff;
            font-size: 14px;
            font-family: 'Pretendard', sans-serif;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }
        .search-input:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        .search-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
            width: 16px;
            height: 16px;
        }
        .sidebar-header .count {
`;
html = html.replace(/\.sidebar-header \.count \{/, searchStyle);

// Insert Search Input in DOM
const searchDom = `            <div>
                <h2>전국 마이스터고</h2>
                <div class="count" id="school-count">총 58개교 목록</div>
                
                <div class="search-container">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="school-search" class="search-input" placeholder="학교명, 지역, 분야 검색...">
                </div>
            </div>`;
html = html.replace(/<div>\s*<h2>전국 마이스터고<\/h2>\s*<div class="count" id="school-count">총 58개교 목록<\/div>\s*<\/div>/, searchDom);

// Change Mesh Material color to Gray
const newMaterialCode = `
            // 회색 톤의 메테리얼 느낌
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x9ca3af,       // 회색 (Gray 400)
                emissive: 0x4b5563,    // 회색 발광 (Gray 600)
                roughness: 0.3,
                metalness: 0.4,
                clearcoat: 0.8,
                clearcoatRoughness: 0.2,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });
`;
html = html.replace(/\/\/\s*그라데이션이 들어간 고급스러운 은색\(Silver\) 느낌 \([^)]*\)\s*const material = new THREE\.MeshPhysicalMaterial\(\{[\s\S]*?\}\);/, newMaterialCode);

// Add search filtering logic
const filterScript = `
        // 검색 필터링 기능
        document.getElementById('school-search').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.school-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const badge = card.querySelector('.region-badge').textContent.toLowerCase();
                const field = card.querySelector('.field-info span:last-child').textContent.toLowerCase();
                
                if(name.includes(searchTerm) || badge.includes(searchTerm) || field.includes(searchTerm)) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            document.getElementById('school-count').textContent = '총 ' + visibleCount + '개교 목록';
        });

        // 8. 데이터 로드 및 렌더링 시작`;
html = html.replace(/\/\/ 8\. 지도 그룹 생성/, filterScript);


fs.writeFileSync('public/map.html', html);
