const fs = require('fs');

let content = fs.readFileSync('src/pages/MyPage.tsx', 'utf-8');

// I removed two closing divs for the parent containers before </main>
// Right now it looks like:
//               </div>
//           </div>
// 
//         </main>
// We need to add one more </div> above </main>
content = content.replace(
    /              <\/div>\s*<\/div>\s*<\/main>/,
    '              </div>\n            </div>\n          </div>\n        </main>'
);

fs.writeFileSync('src/pages/MyPage.tsx', content);
