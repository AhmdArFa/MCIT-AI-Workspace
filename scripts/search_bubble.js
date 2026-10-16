const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  const c = fs.readFileSync(p, 'utf8');
  if (c.includes('What would you like to work on') || c.includes('wMsg') || c.includes('PortraitBubble')) {
    console.log(`Found in ${f}:`);
    let idx = c.indexOf('What would you like to work on');
    if (idx !== -1) console.log('  phrase at', idx, c.slice(idx - 60, idx + 80));
    idx = c.indexOf('wMsg');
    if (idx !== -1) console.log('  wMsg at', idx, c.slice(idx - 60, idx + 80));
  }
}
