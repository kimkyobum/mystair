const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newStarsCode = `
            // 7. 별(Stars) 및 은하수(Milky Way) 배경 생성
            stars = new THREE.Group();
            
            // 일반 별 (배경)
            const starGeo1 = new THREE.BufferGeometry();
            const starMat1 = new THREE.PointsMaterial({ 
                color: 0xffffff, 
                size: 0.08, 
                transparent: true, 
                opacity: 0.9,
                sizeAttenuation: true 
            });
            const starVerts1 = [];
            
            // 은하수 별 (조밀한 띠)
            const starGeo2 = new THREE.BufferGeometry();
            const starMat2 = new THREE.PointsMaterial({ 
                color: 0x60a5fa, // 밝은 파랑
                size: 0.15, 
                transparent: true, 
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });
            const starVerts2 = [];

            // 은하수 중심부 (밝고 큰 별들)
            const starGeo3 = new THREE.BufferGeometry();
            const starMat3 = new THREE.PointsMaterial({ 
                color: 0xd8b4fe, // 밝은 보라
                size: 0.2, 
                transparent: true, 
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });
            const starVerts3 = [];

            // 은하수 먼지 (거대한 희미한 입자들로 은하수 텍스처 느낌 부여)
            const dustGeo = new THREE.BufferGeometry();
            const dustMat = new THREE.PointsMaterial({ 
                color: 0x312e81, // 딥 인디고
                size: 2.5, 
                transparent: true, 
                opacity: 0.15,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const dustVerts = [];

            // 배경 일반 별
            for(let i = 0; i < 5000; i++) {
                starVerts1.push(
                    (Math.random() - 0.5) * 200, 
                    (Math.random() - 0.5) * 200, 
                    (Math.random() - 0.5) * 200
                );
            }

            // 은하수 띠 생성 (나선팔 또는 띠 형태)
            for(let i = 0; i < 8000; i++) {
                // 원기둥 좌표계 기반의 띠 모양 (화면 대각선을 가로지르도록)
                let r = 30 + Math.random() * 50; // 거리
                let theta = Math.random() * Math.PI * 2; // 원통 각도
                
                // 중심에서 멀어질수록 퍼지게 (가우시안 분포 흉내)
                let spread = (Math.random() + Math.random() + Math.random() - 1.5);
                let height = spread * 15; // 띠의 두께
                
                // 원통 좌표계를 3D로
                let x = r * Math.cos(theta);
                let y = height;
                let z = r * Math.sin(theta);

                // 은하수를 45도 기울임
                let tilt = Math.PI / 4;
                let finalX = x * Math.cos(tilt) - y * Math.sin(tilt);
                let finalY = x * Math.sin(tilt) + y * Math.cos(tilt);
                let finalZ = z;

                if (i < 5000) {
                    starVerts2.push(finalX, finalY, finalZ); // 일반 은하수 별
                } else if (i < 7000) {
                    starVerts3.push(finalX, finalY, finalZ); // 밝은 중심부
                } else {
                    dustVerts.push(finalX, finalY, finalZ); // 은하수 성간 먼지
                }
            }

            starGeo1.setAttribute('position', new THREE.Float32BufferAttribute(starVerts1, 3));
            starGeo2.setAttribute('position', new THREE.Float32BufferAttribute(starVerts2, 3));
            starGeo3.setAttribute('position', new THREE.Float32BufferAttribute(starVerts3, 3));
            dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustVerts, 3));

            stars.add(new THREE.Points(starGeo1, starMat1));
            stars.add(new THREE.Points(starGeo2, starMat2));
            stars.add(new THREE.Points(starGeo3, starMat3));
            stars.add(new THREE.Points(dustGeo, dustMat));

            // 지도가 화면 중앙에 있으므로, 은하수가 배경에서 웅장하게 보이도록 살짝 뒤로 밀어줍니다.
            stars.position.z = -20;
            scene.add(stars);
`;

html = html.replace(/\/\/ 7\. 별\(Stars\) 및 은하수\(Milky Way\) 배경 생성[\s\S]*?scene\.add\(stars\);/, newStarsCode);

fs.writeFileSync('public/map.html', html);
