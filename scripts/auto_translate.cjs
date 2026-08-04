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
    let holland = fs.readFileSync('src/data/hollandData.ts', 'utf8');
    let matches = [...holland.matchAll(/text:\s*"([^"]+)"/g)].map(m => m[1]);
    
    // Also include some MyPage text
    matches = matches.concat([
        "마이페이지 프로필이 성공적으로 저장되었습니다!",
        "저장 중 오류가 발생했습니다.",
        "이미지 크기가 너무 큽니다 (1.5MB 이하만 가능합니다)",
        "프로필 사진",
        "정보가 변경·저장되었습니다.",
        "진로 지도 메모 및 소견을 입력하세요.",
        "진로 지도 및 적성 종합 소견",
        "나만의 맞춤 기업을 추천받기 위해 마이페이지에서",
        "학교, 학과, MBTI, 홀랜드 적성검사",
        "프로필 정보가 필요합니다",
        "정보를 먼저 입력해주세요."
    ]);
    
    let dict = {};
    console.log(`Translating ${matches.length} items...`);
    for(let i = 0; i < matches.length; i++) {
        let t = await translateText(matches[i]);
        dict[matches[i]] = t;
        if(i % 10 === 0) console.log(`Progress: ${i}/${matches.length}`);
    }
    
    let lang = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');
    let entries = Object.entries(dict).map(([ko, en]) => `  '${ko.replace(/'/g, "\\'")}': '${en.replace(/'/g, "\\'")}',`).join('\n');
    lang = lang.replace('const koToEnMap: Record<string, string> = {', 'const koToEnMap: Record<string, string> = {\n' + entries);
    
    fs.writeFileSync('src/friend_site/LanguageContext.tsx', lang);
    console.log("Done updating LanguageContext.tsx with Holland and MyPage");
}

run();
