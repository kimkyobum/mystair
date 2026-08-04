const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newStarsCode = `
            // 7. 별(Stars) 및 은하수(Milky Way) 배경 생성
            stars = new THREE.Group();
            
            // 둥근 별 텍스처(Soft Circle) 생성
            const starCanvas = document.createElement('canvas');
            starCanvas.width = 32;
            starCanvas.height = 32;
            const starCtx = starCanvas.getContext('2d');
            
            // 부드러운 빛 효과를 위한 방사형 그라데이션
            const gradient = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            starCtx.fillStyle = gradient;
            starCtx.fillRect(0, 0, 32, 32);
            
            const starTexture = new THREE.CanvasTexture(starCanvas);
            
            // 일반 별 (배경)
            const starGeo1 = new THREE.BufferGeometry();
            const starMat1 = new THREE.PointsMaterial({ 
                color: 0xffffff, 
                size: 0.2, // 텍스처가 흐릿해지므로 크기 증가
                transparent: true, 
                opacity: 0.9,
                map: starTexture,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true 
            });
            const starVerts1 = [];
            
            // 은하수 별 (조밀한 띠)
            const starGeo2 = new THREE.BufferGeometry();
            const starMat2 = new THREE.PointsMaterial({ 
                color: 0x60a5fa, // 밝은 파랑
                size: 0.3, 
                transparent: true, 
                opacity: 0.8,
                map: starTexture,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });
            const starVerts2 = [];

            // 은하수 중심부 (밝고 큰 별들)
            const starGeo3 = new THREE.BufferGeometry();
            const starMat3 = new THREE.PointsMaterial({ 
                color: 0xd8b4fe, // 밝은 보라
                size: 0.4, 
                transparent: true, 
                opacity: 0.9,
                map: starTexture,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });
            const starVerts3 = [];

            // 은하수 먼지 (거대한 희미한 입자들로 은하수 텍스처 느낌 부여)
            const dustGeo = new THREE.BufferGeometry();
            const dustMat = new THREE.PointsMaterial({ 
                color: 0x312e81, // 딥 인디고
                size: 4.0, 
                transparent: true, 
                opacity: 0.15,
                map: starTexture,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const dustVerts = [];
`;

// Replace from "// 7. 별" up to "const dustVerts = [];"
html = html.replace(/\/\/ 7\. 별\(Stars\) 및 은하수\(Milky Way\) 배경 생성[\s\S]*?const dustVerts = \[\];/, newStarsCode);

fs.writeFileSync('public/map.html', html);
