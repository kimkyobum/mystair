import fs from 'fs';
let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
const injectionStr = `
    const todayForPrompt = new Date();
    const currentDateISO = new Date(todayForPrompt.getTime() - todayForPrompt.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const currentDateString = todayForPrompt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
`;
content = content.replace(/(\s*)(const systemInstruction = `)/, (match, p1, p2) => {
    return p1 + injectionStr.trim() + '\n' + p1 + p2;
});
if (content.includes('currentDateISO =')) {
    console.log("Success in ChatInterface");
    fs.writeFileSync('src/components/ChatInterface.tsx', content);
} else {
    console.log("Regex failed ChatInterface");
}

content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/(\s*)(const systemInstruction = `)/, (match, p1, p2) => {
    return p1 + injectionStr.trim() + '\n' + p1 + p2;
});
if (content.includes('currentDateISO =')) {
    console.log("Success in server.ts");
    fs.writeFileSync('server.ts', content);
} else {
    console.log("Regex failed server.ts");
}
