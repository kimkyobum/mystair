const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // In ChatInput.tsx
    content = content.replace(
        /className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 animate-gradient rounded-2xl p-2 sm:p-2\.5 shadow-2xl flex items-center focus-within:ring-4 \$\{isLightMode \? "ring-teal-400\/30" : "ring-purple-500\/30"\} transition-all duration-300 relative group min-h-\[52px\]"/g,
        'className={`w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 animate-gradient rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center focus-within:ring-4 ${isLightMode ? "ring-teal-400/30" : "ring-purple-500/30"} transition-all duration-300 relative group min-h-[52px]`}'
    );
    
    content = content.replace(
        /className="absolute -inset-1 bg-gradient-to-r \$\{isLightMode \? "from-teal-400 to-emerald-400" : "from-purple-600 to-indigo-600"\} rounded-\[20px\] blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10"/g,
        'className={`absolute -inset-1 bg-gradient-to-r ${isLightMode ? "from-teal-400 to-emerald-400" : "from-purple-600 to-indigo-600"} rounded-[20px] blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10`}'
    );

    // In ChatInterface.tsx
    content = content.replace(
        /className="w-full bg-white rounded-2xl sm:rounded-\[32px\] p-1\.5 sm:p-2 shadow-sm border border-gray-200 flex items-center focus-within:ring-2 \$\{isLightMode \? "ring-teal-400\/30" : "ring-purple-400\/30"\} transition-all duration-300 min-h-\[52px\]"/g,
        'className={`w-full bg-white rounded-2xl sm:rounded-[32px] p-1.5 sm:p-2 shadow-sm border border-gray-200 flex items-center focus-within:ring-2 ${isLightMode ? "ring-teal-400/30" : "ring-purple-400/30"} transition-all duration-300 min-h-[52px]`}'
    );
    
    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
}

patchFile('src/components/ChatInput.tsx');
patchFile('src/components/ChatInterface.tsx');
