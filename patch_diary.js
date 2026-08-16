import fs from 'fs';

function patchDiary() {
    let content = fs.readFileSync('src/pages/Diary.tsx', 'utf8');

    // 1. Update handleOpenDayModal definition
    const handleRegex = /const handleOpenDayModal = \(dateStr: string\) => \{\s*setSelectedDate\(dateStr\);\s*const existing = diaries\.find\(d => d\.date === dateStr\);/g;
    
    const newHandle = `const handleOpenDayModal = (dateStr: string, entryId?: string) => {
    setSelectedDate(dateStr);
    const existing = entryId ? diaries.find(d => d.id === entryId) : null;`;
    
    if (content.match(handleRegex)) {
        content = content.replace(handleRegex, newHandle);
        console.log('Patched handleOpenDayModal');
    } else {
        console.log('Failed to find handleOpenDayModal');
    }

    // 2. Update diaryEntry to diaryEntries
    const findRegex = /const diaryEntry = diaries\.find\(d => d\.date === fullDateStr\);/;
    if (content.match(findRegex)) {
        content = content.replace(findRegex, `const diaryEntries = diaries.filter(d => d.date === fullDateStr);`);
        console.log('Patched find to filter');
    } else {
        console.log('Failed to find diaryEntry');
    }

    // 3. Update the rendering of the diary entries
    const renderTarget = `{/* DIARY ENTRY DISPLAY */}
                      {diaryEntry && (
                        <div className={\`p-1 sm:p-1.5 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold truncate shadow-xs text-center border \${isLightMode ? "bg-indigo-50 border-indigo-200 text-indigo-900" : "bg-indigo-500/10 border-indigo-500/25 text-indigo-200"}\`}>
                          <span className="truncate">{t(diaryEntry.title)}</span>
                        </div>
                      )}`;

    const newRender = `{/* DIARY ENTRY DISPLAY */}
                      {diaryEntries.map((entry, idx) => (
                        <div 
                          key={entry.id || idx}
                          onClick={(e) => { e.stopPropagation(); handleOpenDayModal(fullDateStr, entry.id); }}
                          className={\`p-1 sm:p-1.5 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold truncate shadow-xs text-center border transition-colors hover:bg-indigo-100 \${isLightMode ? "bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100" : "bg-indigo-500/10 border-indigo-500/25 text-indigo-200 hover:bg-indigo-500/20"}\`}
                        >
                          <span className="truncate">{t(entry.title)}</span>
                        </div>
                      ))}`;
                      
    if (content.includes('{/* DIARY ENTRY DISPLAY */}')) {
        // Need a robust replace here
        const renderRegex = /\{\/\* DIARY ENTRY DISPLAY \*\/\}\s*\{diaryEntry && \([\s\S]*?\}\)/;
        if (content.match(renderRegex)) {
            content = content.replace(renderRegex, newRender);
            console.log('Patched UI render');
        } else {
            console.log('Failed to patch UI render with regex, trying string replace');
            content = content.replace(renderTarget, newRender);
        }
    } else {
        console.log('Failed to find DIARY ENTRY DISPLAY');
    }

    // 4. Update Hover prompt
    const hoverRegex = /\{!diaryEntry && !exam && \(/g;
    if (content.match(hoverRegex)) {
        content = content.replace(hoverRegex, `{diaryEntries.length === 0 && !exam && (`);
        console.log('Patched hover prompt empty check');
    } else {
        console.log('Failed to find hover check');
    }

    fs.writeFileSync('src/pages/Diary.tsx', content);
    console.log('Diary.tsx written');
}

patchDiary();
