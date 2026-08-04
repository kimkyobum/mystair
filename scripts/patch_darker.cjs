const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

const newLighting = `
            // 4. 조명(Lighting) 설정
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
            dirLight.position.set(-15, 20, 25);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;
            dirLight.shadow.camera.left = -15;
            dirLight.shadow.camera.right = 15;
            dirLight.shadow.camera.top = 15;
            dirLight.shadow.camera.bottom = -15;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 50;
            dirLight.shadow.bias = -0.0001;
            scene.add(dirLight);

            const backLight = new THREE.DirectionalLight(0xd8b4fe, 0.5);
            backLight.position.set(15, -20, 10);
            scene.add(backLight);
            
            const pointLight1 = new THREE.PointLight(0x3b82f6, 1.5, 150); 
            pointLight1.position.set(15, 15, 15);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.5, 150); 
            pointLight2.position.set(-15, -15, 15);
            scene.add(pointLight2);
            
            // 5. 바닥 평면`;

html = html.replace(/\/\/ 4\. 조명\(Lighting\) 설정[\s\S]*?\/\/ 5\. 바닥 평면/, newLighting);

const newMaterialCode = `
            // 차분하고 약간 어두운 회색 톤
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x4b5563,       // 더 어두운 회색 (Gray 600)
                emissive: 0x000000,    // 자체 발광 제거
                roughness: 0.5,
                metalness: 0.2,
                clearcoat: 0.1,        
                clearcoatRoughness: 0.4,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x9ca3af,       // 라인도 연한 회색으로
                linewidth: 1,
                transparent: true,
                opacity: 0.4
            });
`;

html = html.replace(/\/\/\s*명확한 회색 톤의 메테리얼 느낌[\s\S]*?opacity: 0\.5\s*\/\/\s*선을 더 선명하게\s*\}\);/, newMaterialCode);

fs.writeFileSync('public/map.html', html);
