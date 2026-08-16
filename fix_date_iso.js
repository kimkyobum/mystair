import fs from 'fs';

function fixFile(filepath, target) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Find where the systemInstruction starts
    const injectionStr = `
    const todayForPrompt = new Date();
    const currentDateISO = todayForPrompt.toLocaleDateString('fr-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
    const currentDateString = todayForPrompt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' });
`;
    
    if (content.includes("const currentDateISO =")) {
        console.log(`currentDateISO already declared in ${filepath}`);
        return;
    }
    
    content = content.replace(target, injectionStr + "\n" + target);
    fs.writeFileSync(filepath, content);
    console.log(`Injected currentDateISO into ${filepath}`);
}

fixFile('server.ts', 'const systemInstruction = `너는 마이스터고');
fixFile('src/components/ChatInterface.tsx', 'const systemInstruction = `너는 마이스터고');

