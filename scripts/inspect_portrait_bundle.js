const fs = require('fs');

const f = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(f, 'utf8');
const idx = c.indexOf('hx=(0,fx.memo)');
console.log('full hx extended:');
console.log(c.slice(idx, idx + 1400));
