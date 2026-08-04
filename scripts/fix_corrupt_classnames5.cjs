const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// The string is:
// className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm"}
// and
// className={`text-white ${isLightMode ? "text-slate-900" : ""} text-sm font-medium"}

content = content.replace('font-semibold text-sm"}', 'font-semibold text-sm`}');
content = content.replace('text-sm font-medium"}', 'text-sm font-medium`}');

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
