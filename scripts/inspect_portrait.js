const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  try {
    const c = fs.readFileSync(p, 'utf8');
    if (c.includes('portraitVisible')) {
      console.log('portraitVisible found in', f);
      const idx = c.indexOf('portraitVisible');
      console.log(c.slice(Math.max(0, idx - 100), idx + 400));
    }
  } catch (e) {}
}
