const fs = require('fs');

const p = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(p, 'utf8');

const gCIdx = c.indexOf('function gC(');
console.log('gC at:', gCIdx);
if (gCIdx !== -1) {
  console.log(c.slice(gCIdx, gCIdx + 1200));
}

const hxIdx = c.indexOf('function hx(');
console.log('hx at:', hxIdx);
if (hxIdx !== -1) {
  console.log(c.slice(hxIdx, hxIdx + 1200));
}
