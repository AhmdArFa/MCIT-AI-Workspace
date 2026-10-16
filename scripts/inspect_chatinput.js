const fs = require('fs');

const f = '/app/dist/desktop/assets/ChatInput-BO6gAidK.js';
const c = fs.readFileSync(f, 'utf8');
const regex = /[,\s]oi\s*=\s*([^,;]+)/g;
let match;
while ((match = regex.exec(c)) !== null) {
  console.log('oi assignment:', match[0].slice(0, 100));
}
const impIdx = c.indexOf(' as oi');
if (impIdx !== -1) {
  console.log('import as oi:', c.slice(impIdx - 40, impIdx + 60));
}
