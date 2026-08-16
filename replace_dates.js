import fs from 'fs';

function replaceDates(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/"2026-07-20"/g, '`${currentDateISO}`');
    content = content.replace(/"2026-07-21"/g, '`${currentDateISO}`');
    fs.writeFileSync(filepath, content);
    console.log(`Replaced hardcoded dates in ${filepath}`);
}

replaceDates('server.ts');
replaceDates('src/components/ChatInterface.tsx');
