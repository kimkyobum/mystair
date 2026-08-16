import fs from 'fs';
function fixQuotes(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/\`\$\{currentDateISO\}\`/g, '"${currentDateISO}"');
    fs.writeFileSync(filepath, content);
}
fixQuotes('server.ts');
fixQuotes('src/components/ChatInterface.tsx');
