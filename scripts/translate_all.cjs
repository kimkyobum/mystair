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

async function run() {
    let strings = JSON.parse(fs.readFileSync('korean_strings.json', 'utf8'));
    
    let dict = {};
    console.log(`Translating ${strings.length} items...`);
    // Batch translations to speed up and avoid rate limiting
    for(let i = 0; i < strings.length; i++) {
        let t = await translateText(strings[i]);
        dict[strings[i]] = t;
        if(i % 50 === 0) console.log(`Progress: ${i}/${strings.length}`);
        await new Promise(r => setTimeout(r, 100)); // Sleep 100ms
    }
    
    let lang = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');
    let entries = Object.entries(dict).map(([ko, en]) => `  '${ko.replace(/'/g, "\\'")}': '${en.replace(/'/g, "\\'")}',`).join('\n');
    lang = lang.replace('const koToEnMap: Record<string, string> = {', 'const koToEnMap: Record<string, string> = {\n' + entries);
    
    fs.writeFileSync('src/friend_site/LanguageContext.tsx', lang);
    console.log("Done updating LanguageContext.tsx with all translations");
}

run();
