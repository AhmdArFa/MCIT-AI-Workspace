const fs = require('fs');
const path = require('path');

let total = 0;
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules') {
      scan(full);
    } else if (f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.json'))) {
      try {
        const txt = fs.readFileSync(full, 'utf8');
        if (txt.includes('Lobe Theme') || txt.includes('LobeHub')) {
          total++;
          console.log('Found in:', full);
        }
      } catch (e) {}
    }
  }
}
scan('/app/.next');
scan('/app/dist');
scan('/app/public');
console.log('Total files with Lobe Theme/LobeHub:', total);
