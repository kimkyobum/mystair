const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(/<h3 className="text-xl font-bold mb-4 flex items-center justify-between">\s*목표 달성의 막막함\s*<ArrowRight[^>]*\/>\s*<\/h3>/g, '<h3 className="text-xl font-bold mb-4">목표 달성의 막막함</h3>');
code = code.replace(/<h3 className="text-xl font-bold mb-4 flex items-center justify-between">\s*경험의 빠른 휘발\s*<ArrowRight[^>]*\/>\s*<\/h3>/g, '<h3 className="text-xl font-bold mb-4">경험의 빠른 휘발</h3>');
code = code.replace(/<h3 className="text-xl font-bold mb-4 flex items-center justify-between">\s*맞춤 소재 연결의 어려움\s*<ArrowRight[^>]*\/>\s*<\/h3>/g, '<h3 className="text-xl font-bold mb-4">맞춤 소재 연결의 어려움</h3>');

fs.writeFileSync('src/components/Dashboard.tsx', code);
