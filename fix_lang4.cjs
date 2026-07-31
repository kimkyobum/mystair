const fs = require('fs');

let content = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');

// I will just use a regex to strip all keys in koToEnMap that contain HTML tags, because they were wrongly extracted.
// They usually look like: ' /> something\n ... ': '...',
let koToEnMapStart = content.indexOf('const koToEnMap: Record<string, string> = {');
let start = content.slice(0, koToEnMapStart);
let mapContent = content.slice(koToEnMapStart);

let newMapContent = mapContent.split('\n').filter(line => !line.includes(' /> ') && !line.includes('</h3>') && !line.includes('<p className=') && !line.includes('</span>') && !line.includes('<div className=')).join('\n');

fs.writeFileSync('src/friend_site/LanguageContext.tsx', start + newMapContent);
console.log("Fixed lines!");
