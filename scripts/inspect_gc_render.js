const fs = require('fs');

const p = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(p, 'utf8');

const idx = c.indexOf('wMsg');
if (idx !== -1) {
  console.log(c.slice(idx + 500, idx + 1800));
}
