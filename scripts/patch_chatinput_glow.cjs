const fs = require('fs');

let content = fs.readFileSync('src/components/ChatInput.tsx', 'utf-8');

content = content.replace(
    /blur-xl opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10/,
    'blur-xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-50 transition duration-500 -z-10'
);

fs.writeFileSync('src/components/ChatInput.tsx', content);
