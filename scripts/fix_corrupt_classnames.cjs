const fs = require('fs');

let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// The corrupted string looks like:
// className={`text-white ${isLightMode ? "text-slate-900" : ""} ` font-semibold text-sm"}
// Wait, the replacement string was: 'className={`text-white ${isLightMode ? "text-slate-900" : ""} ` '
// So: className="text-white font-semibold text-sm" -> className={`text-white ${isLightMode ? "text-slate-900" : ""} ` font-semibold text-sm"}

content = content.replace(/className=\{`text-white \$\{isLightMode \? "text-slate-900" : ""\} ` /g, 'className={`text-white ${isLightMode ? "text-slate-900" : ""} ');

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
