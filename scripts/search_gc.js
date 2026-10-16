const fs = require('fs');

const p = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(p, 'utf8');

let idx = 0;
while ((idx = c.indexOf('gC', idx)) !== -1) {
  console.log(`gC at ${idx}:`, c.slice(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
  idx += 2;
  if (idx > 196000) break;
}
