const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newMaterialCode = `
            // 깔끔한 기본 회색 톤
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x9ca3af,       // 중간 회색
                emissive: 0x374151,    // 살짝 밝은 회색 발광으로 뚜렷하게
                roughness: 0.6,        // 매트한 느낌
                metalness: 0.1,        // 메탈릭 감소 (자연스러운 회색)
                clearcoat: 0.0,        // 반사 제거
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xd1d5db,       // 밝은 회색 테두리
                linewidth: 1,
                transparent: true,
                opacity: 0.6
            });
`;

html = html.replace(/\/\/\s*차분하고 약간 어두운 회색 톤[\s\S]*?opacity: 0\.4\s*\}\);/, newMaterialCode);

fs.writeFileSync('public/map.html', html);
