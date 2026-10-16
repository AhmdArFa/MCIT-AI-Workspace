const fs = require('fs');
const path = require('path');

const dirs = ['/app/dist/desktop/assets', '/app/.next/server', '/app/.next/static'];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  console.log('=== Scanning ' + dir + ' ===');
  function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (f.endsWith('.js') || f.endsWith('.json')) {
        const c = fs.readFileSync(full, 'utf8');
        const matches = c.match(/(?:LobeChat|LobeHub|LobeAgent|Lobe|lobe-chat|\blobe\b)/gi);
        if (matches) {
          const brand = matches.filter(m => {
            const l = m.toLowerCase();
            return !['globe', 'globes', 'lobestatic', 'lobetheme', 'lobe-theme', '@lobehub'].includes(l);
          });
          if (brand.length > 0) {
            console.log(path.relative(dir, full) + ': ' + brand.length + ' occurrences. [' + [...new Set(brand)].slice(0, 5).join(', ') + ']');
          }
        }
      }
    }
  }
  walk(dir);
}
