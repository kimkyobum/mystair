const fs = require('fs');

let content = fs.readFileSync('src/friend_site/LanguageContext.tsx', 'utf8');

// The problematic lines have multiple lines because the key spans multiple lines.
// Actually, it's easier to just parse the file, remove the bad keys. Wait, since the file itself has syntax errors (Unterminated string literal), we can just remove lines from 93 to 142 maybe? Let's look closely at line 93.

// Let's use a regex to match keys that contain "/>" or "</" or className
// Wait, the syntax error is that the key string has actual newlines inside it without backticks.
// Let's just fix the whole block in LanguageContext by reading it, finding the koToEnMap definition, and replacing it.

// Or we can just read the file as text and remove lines that have syntax errors.
// Looking at the output of sed, lines 93 to 142 contain these malformed entries.
