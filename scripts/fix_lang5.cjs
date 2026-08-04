const fs = require('fs');
let lines = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8').split('\n');

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // We want to skip any line in the map that doesn't start with a valid key format, or contains html tags
    // The valid format is usually:   'KoreanText': 'EnglishText',
    
    if (line.includes("<span className=") || line.includes("</span") || line.includes("<div") || line.includes("</div") || line.includes("<h3") || line.includes("</h3")) {
        skip = true;
    }
    
    if (skip) {
        if (line.trim().endsWith("',") || line.trim().endsWith("', ")) {
            skip = false;
        }
        continue;
    }
    
    // Some lines might just be continuation of broken strings.
    if(line.includes("': '") || line.trim() === "const koToEnMap: Record<string, string> = {" || line.trim() === "};" || !line.includes("'")) {
        newLines.push(line);
    }
}

fs.writeFileSync('src/friend_site/LanguageContext.tsx', newLines.join('\n'));
console.log("Fixed lines!");
