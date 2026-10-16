const fs = require('fs');
const path = require('path');
const dir = '/app/dist/desktop/assets';
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = c.match(/(?:LobeChat|LobeHub|LobeAgent|\bLobe\b)/g);
    if (m) console.log(f + ': ' + m.length + ' occurrences. Unique: ' + [...new Set(m)].join(', '));
  }
}
