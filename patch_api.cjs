const fs = require('fs');
let content = fs.readFileSync('src/api_client/api.ts', 'utf8');

const targetStr = `    // Update Local Storage - Replace any existing entry for the exact same date
    const existing = await this.getDiaries(uid);
    const filtered = existing.filter(d => d.date !== newEntry.date);
    const updated = [newEntry, ...filtered];`;

const replacementStr = `    // Update Local Storage - DO NOT replace by date, allow multiple entries per day
    const existing = await this.getDiaries(uid);
    // Only replace if ID matches (for updates), otherwise append
    const filtered = existing.filter(d => d.id !== newEntry.id);
    const updated = [newEntry, ...filtered];`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/api_client/api.ts', content);
    console.log("Patched api.ts successfully");
} else {
    console.log("Failed to find target string in api.ts");
}
