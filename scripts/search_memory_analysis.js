const fs = require('fs');
const path = require('path');

const dir = '/app/dist/desktop/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const p = path.join(dir, f);
  const c = fs.readFileSync(p, 'utf8');
  if (c.includes('Request memory analysis') || c.includes('No Memories Yet') || c.includes('userMemory.')) {
    console.log(`Found in ${f}:`);
    if (c.includes('Request memory analysis')) console.log('  has "Request memory analysis"');
    if (c.includes('No Memories Yet')) console.log('  has "No Memories Yet"');
  }
}
