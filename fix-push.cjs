const fs = require('fs');
let content = fs.readFileSync('src/pages/adminPortal.js', 'utf8');
content = content.replace(/mode:\s*'no-cors',\s*/g, '');
content = content.replace(/['"]Content-Type['"]\s*:\s*['"]text\/plain['"]/g, "'Content-Type': 'application/json'");
fs.writeFileSync('src/pages/adminPortal.js', content);
console.log('Done!');
