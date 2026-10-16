const fs = require('fs');
const path = require('path');

const exclude = ['node_modules', '.git', '.next', 'dist', 'build', '.venv', '__pycache__', 'uv.lock'];

function search(dir) {
  let hits = [];
  try {
    for (const item of fs.readdirSync(dir)) {
      if (exclude.includes(item)) continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        hits.push(...search(full));
      } else if (/\.(ts|tsx|js|jsx|json|md|html)$/.test(item)) {
        const text = fs.readFileSync(full, 'utf8');
        // Match word boundary lobe, excluding @lobehub, lobe-chat package names if purely dependency
        const matches = text.match(/\blobe[a-z0-9_-]*/gi);
        if (matches) {
          const userFacing = matches.filter(m => {
            const lower = m.toLowerCase();
            return !lower.startsWith('lobehub') && !lower.startsWith('lobe-theme') && !lower.startsWith('lobe-i18n');
          });
          if (userFacing.length > 0) {
            hits.push({ file: full, count: userFacing.length, samples: userFacing.slice(0, 5) });
          }
        }
      }
    }
  } catch (e) {}
  return hits;
}

console.log('Searching agent/packages...');
const pkgHits = search('C:\\MCIT AI Final\\agent\\packages');
pkgHits.forEach(h => console.log(`${h.file}: ${h.count} hits (${h.samples.join(', ')})`));

console.log('\nSearching agent/locales...');
const locHits = search('C:\\MCIT AI Final\\agent\\locales');
locHits.forEach(h => console.log(`${h.file}: ${h.count} hits (${h.samples.join(', ')})`));

console.log('\nSearching agent/src (settings / features)...');
const srcHits = search('C:\\MCIT AI Final\\agent\\src\\features\\Settings');
srcHits.forEach(h => console.log(`${h.file}: ${h.count} hits (${h.samples.join(', ')})`));
