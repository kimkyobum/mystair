const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const regex1 = /<div className="bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-3xl p-8 h-full hover:bg-white\/10 hover:-translate-y-2 transition-all duration-300 pointer-events-auto relative overflow-hidden group shadow-lg shadow-black\/50">\s*<div className="absolute inset-0 bg-gradient-to-br from-red-500\/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"><\/div>\s*<div className="bg-red-500\/20 p-4 rounded-2xl inline-block mb-6 border border-red-500\/30 shadow-\[0_0_20px_rgba\(239,68,68,0\.2\)\] group-hover:scale-110 transition-transform duration-300">\s*<Target className="w-8 h-8 text-red-400" \/>\s*<\/div>/;

const repl1 = `<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-red-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bullseye/3D/bullseye_3d.png" alt="Target" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>`;


const regex2 = /<div className="bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-3xl p-8 h-full hover:bg-white\/10 hover:-translate-y-2 transition-all duration-300 pointer-events-auto relative overflow-hidden group shadow-lg shadow-black\/50">\s*<div className="absolute inset-0 bg-gradient-to-br from-orange-500\/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"><\/div>\s*<div className="bg-orange-500\/20 p-4 rounded-2xl inline-block mb-6 border border-orange-500\/30 shadow-\[0_0_20px_rgba\(249,115,22,0\.2\)\] group-hover:scale-110 transition-transform duration-300">\s*<AlertCircle className="w-8 h-8 text-orange-400" \/>\s*<\/div>/;

const repl2 = `<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-orange-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hourglass%20not%20done/3D/hourglass_not_done_3d.png" alt="Hourglass" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>`;

const regex3 = /<div className="bg-white\/5 backdrop-blur-xl border border-white\/10 rounded-3xl p-8 h-full hover:bg-white\/10 hover:-translate-y-2 transition-all duration-300 pointer-events-auto relative overflow-hidden group shadow-lg shadow-black\/50">\s*<div className="absolute inset-0 bg-gradient-to-br from-pink-500\/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"><\/div>\s*<div className="bg-pink-500\/20 p-4 rounded-2xl inline-block mb-6 border border-pink-500\/30 shadow-\[0_0_20px_rgba\(236,72,153,0\.2\)\] group-hover:scale-110 transition-transform duration-300">\s*<FileText className="w-8 h-8 text-pink-400" \/>\s*<\/div>/;

const repl3 = `<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 pointer-events-auto relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 bg-pink-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors"></div>
              <div className="inline-block mb-6 w-16 h-16 relative transform group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Puzzle%20piece/3D/puzzle_piece_3d.png" alt="Puzzle" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>`;

code = code.replace(regex1, repl1);
code = code.replace(regex2, repl2);
code = code.replace(regex3, repl3);

fs.writeFileSync('src/components/Dashboard.tsx', code);
