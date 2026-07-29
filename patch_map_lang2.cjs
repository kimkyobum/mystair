const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

// Replace renderSchoolList() with populateSidebar()
html = html.replace(/renderSchoolList\(\)/g, "populateSidebar()");

fs.writeFileSync('public/map.html', html);
