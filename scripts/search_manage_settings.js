const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  const c = fs.readFileSync(p, 'utf8');
  if (c.includes('manage_settings')) {
    console.log(`manage_settings in ${f}`);
  }
}
