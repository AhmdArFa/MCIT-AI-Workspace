const fs = require('fs');

const f = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(f, 'utf8');
const idx = c.indexOf('gC=');
console.log('gC full:');
console.log(c.slice(idx, idx + 1500));
