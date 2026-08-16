import fs from 'fs';

function fixFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    const injectionStr = `
    const todayForPrompt = new Date();
    const currentDateISO = todayForPrompt.toLocaleDateString('fr-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
    const currentDateString = todayForPrompt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
`;
    
    if (!content.includes('const currentDateISO =')) {
        content = content.replace(/(\s*)(const systemInstruction = `너는 마이스터고)/, (match, p1, p2) => {
            return p1 + injectionStr.trim() + '\n' + p1 + p2;
        });
        fs.writeFileSync(filepath, content);
        console.log(`Injected currentDateISO into ${filepath}`);
    } else {
        console.log(`Already injected in ${filepath}`);
    }
}

fixFile('server.ts');
fixFile('src/components/ChatInterface.tsx');

