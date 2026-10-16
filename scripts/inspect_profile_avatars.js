const fs = require('fs');

const p = '/app/dist/desktop/assets/profile-Bac-vNLs.js';
const c = fs.readFileSync(p, 'utf8');

// Find all occurrences of bt
let idx = 0;
while ((idx = c.indexOf('bt', idx)) !== -1) {
  console.log(`bt at ${idx}:`, c.slice(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
  idx += 2;
  if (idx > 72000) break;
}
