const fs = require('fs');

const p = '/app/dist/desktop/assets/app-const-BAiRd4u2.js';
const c = fs.readFileSync(p, 'utf8');

const idx = c.indexOf('Xn=');
console.log('Xn= at:', idx);
if (idx !== -1) {
  console.log(c.slice(idx, idx + 1000));
}
