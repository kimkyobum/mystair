const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

// The problematic string in CompanySearch.tsx
content = content.replace(/className=\{`text-white \$\{isLightMode \? "text-slate-900" : ""\} ([a-zA-Z0-9\s\-]+)"\}/g, 'className={`text-white ${isLightMode ? "text-slate-900" : ""} $1`}');

// Also catch the specific one if the general one fails
content = content.replace('font-semibold text-sm"}', 'font-semibold text-sm`}');
content = content.replace('` text-sm font-medium"}', 'text-sm font-medium`}');

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
