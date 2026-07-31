const fs = require('fs');

function extractKorean(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    // Extract strings that contain Korean
    const regex = /['"]([^'"]*[\u3131-\u318E\uAC00-\uD7A3]+[^'"]*)['"]/g;
    const matches = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        // Exclude some things like class names with korean (rare) or purely very long texts that are hard to match exactly if they contain vars
        if(!match[1].includes('${') && match[1].length < 100) {
            matches.add(match[1]);
        }
    }
    
    // Also extract text inside JSX nodes
    const jsxRegex = />([^<]*[\u3131-\u318E\uAC00-\uD7A3]+[^<]*)<\//g;
    while ((match = jsxRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if(text && !text.includes('{') && text.length < 100) {
            matches.add(text);
        }
    }
    
    return Array.from(matches);
}

let allText = new Set([
    ...extractKorean('src/pages/CompanySearch.tsx'),
    ...extractKorean('src/pages/MyPage.tsx'),
    ...extractKorean('src/pages/Certificates.tsx')
]);

fs.writeFileSync('korean_strings.json', JSON.stringify(Array.from(allText), null, 2));
console.log(`Extracted ${allText.size} strings to korean_strings.json`);
