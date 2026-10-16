const fs = require('fs');

const p = '/app/frontend/.next/server/chunks/ssr/_1md1ks3._.js';
const content = fs.readFileSync(p, 'utf8');
const needle = 'Royal Gold';
const idx = content.indexOf(needle);
console.log('SSR contains Royal Gold:', idx !== -1);
if (idx !== -1) {
  console.log(content.slice(idx - 20, idx + 100));
}
