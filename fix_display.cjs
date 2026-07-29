const fs = require('fs');
let html = fs.readFileSync('public/map.html', 'utf8');

html = html.replace(/card\.style\.display = 'flex';/g, "card.style.display = 'block';");

fs.writeFileSync('public/map.html', html);
