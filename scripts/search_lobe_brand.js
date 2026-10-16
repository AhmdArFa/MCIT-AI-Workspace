const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  const c = fs.readFileSync(p, 'utf8');
  const m = c.match(/LobeChat|Lobe Hub|Lobe/g);
  if (m && m.length > 0) {
    // filter out pure variable names like globe or lobe if not brand
    const brandMatches = c.match(/(?:LobeChat|LobeAgent|Lobe Hub|Lobe)/g);
    if (brandMatches) {
      console.log(`${f}: ${brandMatches.length} occurrences, sample:`);
      let idx = c.indexOf('Lobe');
      console.log(' ', c.slice(Math.max(0, idx - 30), Math.min(c.length, idx + 50)));
    }
  }
}
