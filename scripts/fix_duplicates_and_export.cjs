const fs = require('fs');

let content = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');

// 1. Ensure useLanguage is exported at the end
if (!content.includes('export function useLanguage')) {
  content = content.trimRight();
  if (content.endsWith('};')) {
    content += `\n\nexport function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}\n`;
  }
}

// 2. Let's deduplicate keys in koToEnMap
// We can do this by parsing the file line by line inside koToEnMap
let lines = content.split('\n');
let newLines = [];
let insideMap = false;
let seenKeys = new Set();

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('const koToEnMap: Record<string, string> = {')) {
    insideMap = true;
    newLines.push(line);
    continue;
  }
  if (insideMap && line.includes('};')) {
    insideMap = false;
    newLines.push(line);
    continue;
  }
  if (insideMap) {
    let match = line.match(/^\s*'([^']+)': '.*',?\s*$/);
    if (match) {
      let key = match[1];
      if (seenKeys.has(key)) {
        continue; // skip duplicate key
      }
      seenKeys.add(key);
    }
  }
  newLines.push(line);
}

fs.writeFileSync('src/friend_site/LanguageContext.tsx', newLines.join('\n'));
console.log("Fixed duplicates and added useLanguage export!");
