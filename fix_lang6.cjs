const fs = require('fs');
let lines = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8').split('\n');

let newLines = [];
let insideMap = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (line.includes("const koToEnMap")) {
        insideMap = true;
    }
    
    if (insideMap && line.includes("};")) {
        insideMap = false;
        newLines.push(line);
        continue;
    }
    
    if (insideMap) {
        if(line.includes("const koToEnMap")) {
            newLines.push(line);
        } else {
            // only keep valid dictionary lines
            if(line.match(/^\s*'.*': '.*',?\s*$/)) {
                newLines.push(line);
            }
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync('src/friend_site/LanguageContext.tsx', newLines.join('\n'));
console.log("Fixed lines completely!");
