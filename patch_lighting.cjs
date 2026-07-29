const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

// Replace the lighting section
const newLighting = `
            // 4. 조명(Lighting) 설정 (은색 메탈릭 그라데이션 반사를 위해 재설정)
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
            scene.add(ambientLight);

            // 주요 메탈릭 반사를 만드는 주 조명 (차가운 빛)
            const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
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

            // 보조 메탈릭 반사를 만드는 후면 조명 (은은한 보라/핑크빛)
            const backLight = new THREE.DirectionalLight(0xd8b4fe, 1.0);
            backLight.position.set(15, -20, 10);
            scene.add(backLight);
            
            // 은색 메테리얼에 그라데이션 반사 느낌을 주기 위한 다채로운 포인트 조명 세팅
            const pointLight1 = new THREE.PointLight(0x3b82f6, 3.0, 150); // 파란빛
            pointLight1.position.set(15, 15, 15);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x8b5cf6, 3.0, 150); // 보랏빛
            pointLight2.position.set(-15, -15, 15);
            scene.add(pointLight2);
            
            // 5. 바닥 평면`;

html = html.replace(/\/\/ 4\. 조명\(Lighting\) 설정[\s\S]*?\/\/ 5\. 바닥 평면/, newLighting);

fs.writeFileSync('public/map.html', html);
