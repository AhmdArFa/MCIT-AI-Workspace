const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  try {
    const c = fs.readFileSync(p, 'utf8');
    if (c.includes('HomeEditorInput') || c.includes('EditorInput-BJlPxKuV')) {
      console.log('Found in', f);
      const idx = c.indexOf('EditorInput-BJlPxKuV');
      if (idx !== -1) {
        console.log(c.slice(Math.max(0, idx - 100), idx + 200));
      }
    }
  } catch (e) {}
}
