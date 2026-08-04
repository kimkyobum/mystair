const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // In ChatInput.tsx
    content = content.replace(/ring-purple-500\/30/g, '${isLightMode ? "ring-teal-400/30" : "ring-purple-500/30"}');
    content = content.replace(/from-purple-600 to-indigo-600/g, '${isLightMode ? "from-teal-400 to-emerald-400" : "from-purple-600 to-indigo-600"}');

    // In ChatInterface.tsx
    content = content.replace(/ring-purple-400\/30/g, '${isLightMode ? "ring-teal-400/30" : "ring-purple-400/30"}');
    
    fs.writeFileSync(filepath, content);
    console.log(`Patched ${filepath}`);
}

patchFile('src/components/ChatInput.tsx');
patchFile('src/components/ChatInterface.tsx');
