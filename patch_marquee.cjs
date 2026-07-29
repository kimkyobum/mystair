const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');
code = code.replace(/transform: translateX\(-100\%\);/, 'transform: translateX(-10%);');
fs.writeFileSync('src/index.css', code);

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dash = dash.replace(/\[\.\.\.Array\(3\)\]/g, '[...Array(10)]');
fs.writeFileSync('src/components/Dashboard.tsx', dash);
