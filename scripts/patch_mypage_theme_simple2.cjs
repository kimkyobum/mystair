const fs = require('fs');

let content = fs.readFileSync('src/pages/MyPage.tsx', 'utf-8');

const startStr = '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">';
const endStr = '</div>\n            </div>\n\n          </div>';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex);
    const after = content.slice(endIndex);
    
    const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Light Mode */}
                <button
                  onClick={() => setIsLightMode(true)}
                  className={\`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer \${
                    isLightMode ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }\`}
                >
                  <Sun size={24} className={isLightMode ? 'text-amber-500 mb-2' : 'mb-2'} />
                  <span className="font-bold text-sm">{t('라이트 모드 (기본)', 'Light Mode')}</span>
                  <span className="text-xs mt-1 opacity-70">{t('깔끔한 화이트 테마', 'Clean white theme')}</span>
                </button>

                {/* Space Mode (Dark) */}
                <button
                  onClick={() => {
                    setIsLightMode(false);
                    setBackgroundType('black');
                  }}
                  className={\`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer \${
                    !isLightMode ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }\`}
                >
                  <Moon size={24} className={!isLightMode ? 'text-indigo-500 mb-2' : 'mb-2'} />
                  <span className="font-bold text-sm">{t('우주 모드', 'Space Mode')}</span>
                  <span className="text-xs mt-1 opacity-70">{t('아름다운 별빛 테마', 'Beautiful starlight theme')}</span>
                </button>
              </div>`;

    content = before + replacement + '\n            ' + after;
    fs.writeFileSync('src/pages/MyPage.tsx', content);
    console.log("Patched successfully.");
} else {
    console.log("Not found.");
}
