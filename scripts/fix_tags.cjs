const fs = require('fs');

let content = fs.readFileSync('src/pages/MyPage.tsx', 'utf-8');

// I will just find the Box 8 block, and replace everything up to the Footer Bar with exactly the correct structure.
const startBox8 = content.indexOf('{/* Box 8: 화면 테마 설정 */}');
const startFooter = content.indexOf('{/* Footer Bar */}');

const before = content.slice(0, startBox8);
const after = content.slice(startFooter);

const box8Str = `{/* Box 8: 화면 테마 설정 */}
            <div className="bg-white rounded-2xl p-5 border-2 border-transparent hover:border-purple-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 text-slate-900 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-500/10 text-purple-600 rounded-lg">
                    <ImageIcon size={16} />
                  </span>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{t('화면 및 배경 설정')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>

          `;

content = before + box8Str + after;

fs.writeFileSync('src/pages/MyPage.tsx', content);
