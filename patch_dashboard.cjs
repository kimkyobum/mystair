const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Remove recharts import
code = code.replace(/import \{ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar \} from 'recharts';\n/, '');

// Remove data array
code = code.replace(/const data = \[\s*\{ name: '3월', 실습일수: 12, 자격증: 2 \},\s*\{ name: '4월', 실습일수: 18, 자격증: 4 \},\s*\{ name: '5월', 실습일수: 22, 자격증: 6 \},\s*\{ name: '6월', 실습일수: 25, 자격증: 8 \},\s*\{ name: '7월', 실습일수: 28, 자격증: 10 \},\s*\{ name: '8월', 실습일수: 20, 자격증: 12 \},\s*\{ name: '9월', 실습일수: 26, 자격증: 15 \},\s*\];\n+/, '');

// Remove Dynamic Chart Section
const chartSectionRegex = /\s*\{\/\* Dynamic Chart Section \*\/\}\s*<FadeIn delay=\{0\.4\}>\s*<div className="bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-3xl p-8 pointer-events-auto relative overflow-hidden">[\s\S]*?<\/AreaChart>\s*<\/ResponsiveContainer>\s*<\/div>\s*<\/div>\s*<\/FadeIn>/;
code = code.replace(chartSectionRegex, '');

fs.writeFileSync('src/components/Dashboard.tsx', code);
