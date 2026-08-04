const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newStarsCode = `
            // 7. 별(Stars) 및 은하수(Milky Way) 배경 생성
            stars = new THREE.Group();
            
            // 일반 별
            const starGeometry1 = new THREE.BufferGeometry();
            const starMaterial1 = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 });
            const starVertices1 = [];
            
            // 은하수 별 (조밀하고 약간의 색상 띠)
            const starGeometry2 = new THREE.BufferGeometry();
            const starMaterial2 = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.08, transparent: true, opacity: 0.6 });
            const starVertices2 = [];

            const starGeometry3 = new THREE.BufferGeometry();
            const starMaterial3 = new THREE.PointsMaterial({ color: 0xc4b5fd, size: 0.1, transparent: true, opacity: 0.5 });
            const starVertices3 = [];

            for(let i = 0; i < 4000; i++) {
                // 일반 무작위 별
                starVertices1.push((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
            }

            for(let i = 0; i < 3000; i++) {
                // 은하수 띠 (대각선으로 뭉치도록 분포)
                let u = Math.random();
                let v = Math.random();
                let theta = u * 2.0 * Math.PI;
                let phi = Math.acos(2.0 * v - 1.0);
                let r = 40 + Math.random() * 40;
                
                // 은하수 밴드 형태로 모이게 (y축 중심, 대각선 기울임)
                let x = r * Math.sin(phi) * Math.cos(theta);
                let y = (Math.random() - 0.5) * 20 + r * Math.cos(phi) * 0.2; 
                let z = r * Math.sin(phi) * Math.sin(theta);

                // 회전 변환 (은하수 띠 기울기)
                let tempX = x * Math.cos(Math.PI/4) - y * Math.sin(Math.PI/4);
                let tempY = x * Math.sin(Math.PI/4) + y * Math.cos(Math.PI/4);
                
                if(i % 2 === 0) {
                    starVertices2.push(tempX, tempY, z);
                } else {
                    starVertices3.push(tempX, tempY, z);
                }
            }

            starGeometry1.setAttribute('position', new THREE.Float32BufferAttribute(starVertices1, 3));
            starGeometry2.setAttribute('position', new THREE.Float32BufferAttribute(starVertices2, 3));
            starGeometry3.setAttribute('position', new THREE.Float32BufferAttribute(starVertices3, 3));

            stars.add(new THREE.Points(starGeometry1, starMaterial1));
            stars.add(new THREE.Points(starGeometry2, starMaterial2));
            stars.add(new THREE.Points(starGeometry3, starMaterial3));

            scene.add(stars);
`;

html = html.replace(/\/\/ 7\. 별\(Stars\) 배경 생성[\s\S]*?scene\.add\(stars\);/, newStarsCode);

// Modify material to silver gradient
const newMaterialCode = `
            // 그라데이션이 들어간 고급스러운 은색(Silver) 느낌
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xeeeeee,       // 밝은 은색
                emissive: 0x111111,    // 아주 약간의 발광
                roughness: 0.1,        // 매끄러운 금속
                metalness: 1.0,        // 완전한 금속성
                clearcoat: 1.0,        // 코팅된 듯한 반사
                clearcoatRoughness: 0.1,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,       // 라인도 은색/흰색에 가깝게
                linewidth: 1,
                transparent: true,
                opacity: 0.5         // 선을 더 선명하게
            });
`;

html = html.replace(/const material = new THREE\.MeshStandardMaterial\(\{[\s\S]*?\}\);\s*const lineMaterial = new THREE\.LineBasicMaterial\(\{[\s\S]*?\}\);/, newMaterialCode);

// Also add a directional light with color to create the gradient reflection on the silver
// Right before "// 5. 바닥 평면"
const newLightCode = `
            // 은색 메테리얼에 그라데이션 반사 느낌을 주기 위한 다채로운 조명 세팅
            const pointLight1 = new THREE.PointLight(0x3b82f6, 4.0, 150); // 파란빛
            pointLight1.position.set(15, 15, 15);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x8b5cf6, 4.0, 150); // 보랏빛
            pointLight2.position.set(-15, -15, 15);
            scene.add(pointLight2);
            
            // 5. 바닥 평면`;

html = html.replace(/\/\/ 5\. 바닥 평면/, newLightCode);

// Add nebula gradient to CSS background
html = html.replace(/background: #020617; \/\* Very deep modern slate \*\//, `background: #000000; /* Deep space */`);
html = html.replace(/radial-gradient\(ellipse at 50% -20%, rgba\(30, 58, 138, 0\.4\), transparent 60%\), \n                radial-gradient\(circle at bottom right, rgba\(15, 118, 110, 0\.2\), transparent 50%\),\n                linear-gradient\(to bottom, transparent, rgba\(0, 0, 0, 0\.4\)\);/g, `radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 1), transparent 80%), \n                radial-gradient(circle at 20% 80%, rgba(30, 58, 138, 0.4), transparent 50%),\n                radial-gradient(circle at 80% 20%, rgba(76, 29, 149, 0.3), transparent 50%),\n                linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.9));`);


fs.writeFileSync('public/map.html', html);
