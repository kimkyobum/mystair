const fs = require('fs');

let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// Find all occurrences where it starts with className={`text-white ${isLightMode ? "text-slate-900" : ""} 
// and ends with "} instead of `}

content = content.replace(/className=\{`text-white \$\{isLightMode \? "text-slate-900" : ""\} ([^`]+?)"\}/g, 'className={`text-white ${isLightMode ? "text-slate-900" : ""} $1`}');

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
