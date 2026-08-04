const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

const target1 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm"}';
const replace1 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm`}';

content = content.replace(target1, replace1);

const target2 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} ` text-sm font-medium"}';
const replace2 = 'className={`text-white ${isLightMode ? "text-slate-900" : ""} text-sm font-medium`}';

content = content.replace(target2, replace2);

// Check if any `text-white ... "} are remaining
const regex = /className=\{`text-white \$\{isLightMode \? "text-slate-900" : ""\} ([^`]+?)"\}/g;
content = content.replace(regex, 'className={`text-white ${isLightMode ? "text-slate-900" : ""} $1`}');


fs.writeFileSync('src/pages/CompanySearch.tsx', content);
