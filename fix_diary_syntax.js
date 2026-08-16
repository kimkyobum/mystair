import fs from 'fs';

let content = fs.readFileSync('src/pages/Diary.tsx', 'utf8');

const regex = /(\{\/\* DIARY ENTRY DISPLAY \*\/\}\s*\{diaryEntries\.map\(\(entry, idx\) => \([\s\S]*?\)\)\}\})/;

const newTail = `
                    </div>
                    {/* Hover add prompt if empty */}
                    {diaryEntries.length === 0 && !exam && (
                      <div className={\`opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-center \${isLightMode ? "text-indigo-600" : "text-indigo-500"}\`}>
                        + {t('일기 쓰기')}
                      </div>
                    )}
                  </div>
                );
              })}
`;

content = content.replace(regex, "$1" + newTail);

fs.writeFileSync('src/pages/Diary.tsx', content);
console.log("Fixed syntax");
