const fs = require('fs');
let code = fs.readFileSync('public/map.html', 'utf8');

// 1. Title font size
code = code.replace(/font-size: 46px;/, 'font-size: 36px;');

// 2. Remove focusOnSchool on search
code = code.replace(/if \(firstMatch && searchTerm !== ''\) \{\s*focusOnSchool\(firstMatch\);\s*\}/, "if (firstMatch && searchTerm !== '') {\n                // focusOnSchool(firstMatch);\n            }");

// 3. Fix focusOnSchool to pan instead of resetting camera
const oldFocus = `                controls.target.copy(targetPos);
                // 약간 줌인된 위치로 카메라 이동
                camera.position.set(targetPos.x, targetPos.y - 8, targetPos.z + 12);
                controls.update();`;

const newFocus = `                const offset = targetPos.clone().sub(controls.target);
                camera.position.add(offset);
                controls.target.copy(targetPos);
                controls.update();`;

code = code.replace(oldFocus, newFocus);

fs.writeFileSync('public/map.html', code);
