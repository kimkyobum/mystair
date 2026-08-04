const fs = require('fs');
let content = fs.readFileSync('src/pages/CompanySearch.tsx', 'utf-8');

content = content.replace(/font-semibold text-sm"\}/g, 'font-semibold text-sm`}');
content = content.replace(/text-sm font-medium"\}/g, 'text-sm font-medium`}');

fs.writeFileSync('src/pages/CompanySearch.tsx', content);
