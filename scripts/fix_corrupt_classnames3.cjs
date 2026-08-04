const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// The string is exactly:
// className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm"}
// Let's replace it manually for each instance or write a general one
const searchStr = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm"}';
const replaceStr = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm`}';

content = content.split(searchStr).join(replaceStr);

// Let's also check for other possible corruptions with text-white
const searchStr2 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} text-sm font-medium"}';
const replaceStr2 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} text-sm font-medium`}';

content = content.split(searchStr2).join(replaceStr2);

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
