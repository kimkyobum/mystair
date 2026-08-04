const fs = require('fs');
const https = require('https');

async function translateText(text) {
    if(!text || text.trim() === '') return text;
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let result = '';
                    parsed[0].forEach(p => result += p[0]);
                    resolve(result);
                } catch(e) {
                    resolve(text);
                }
            });
        }).on('error', () => resolve(text));
    });
}

function extractKorean(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const regex = /['"]([^'"]*[\u3131-\u318E\uAC00-\uD7A3]+[^'"]*)['"]/g;
    const matches = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        if(!match[1].includes('${') && match[1].length < 100) {
            matches.add(match[1]);
        }
    }
    const jsxRegex = />([^<]*[\u3131-\u318E\uAC00-\uD7A3]+[^<]*)<\//g;
    while ((match = jsxRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if(text && !text.includes('{') && text.length < 100) {
            matches.add(text);
        }
    }
    return Array.from(matches);
}

async function run() {
    let strings = extractKorean('src/pages/Creators.tsx');
    let dict = {};
    for(let i = 0; i < strings.length; i++) {
        let t = await translateText(strings[i]);
        dict[strings[i]] = t;
    }
    
    let lang = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');
    let entries = Object.entries(dict).map(([ko, en]) => `  '${ko.replace(/'/g, "\\'")}': '${en.replace(/'/g, "\\'")}',`).join('\n');
    lang = lang.replace('const koToEnMap: Record<string, string> = {', 'const koToEnMap: Record<string, string> = {\n' + entries);
    
    fs.writeFileSync('src/friend_site/LanguageContext.tsx', lang);
    
    // Wrap with t()
    let content = fs.readFileSync('src/pages/Creators.tsx', 'utf8');
    content = content.replace(/(>)([^<]*[\u3131-\u318E\uAC00-\uD7A3]+[^<]*)(<\/)/g, (match, p1, p2, p3) => {
        let text = p2.trim();
        if(text.includes('{') || text.includes('}') || text.length > 80) return match;
        if(text.includes("'")) return `${p1}{t("${text}")}${p3}`;
        return `${p1}{t('${text}')}${p3}`;
    });
    fs.writeFileSync('src/pages/Creators.tsx', content);

    console.log("Done updating Creators.tsx");
}

run();
