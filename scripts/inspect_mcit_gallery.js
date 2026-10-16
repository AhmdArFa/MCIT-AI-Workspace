const fs = require('fs');

const p = '/app/dist/desktop/assets/profile-Bac-vNLs.js';
const c = fs.readFileSync(p, 'utf8');

const idx = c.indexOf('MCIT gallery (local)');
console.log('MCIT gallery at:', idx);
if (idx !== -1) {
  console.log(c.slice(idx - 300, idx + 400));
}
