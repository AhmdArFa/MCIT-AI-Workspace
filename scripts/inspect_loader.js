const fs = require('fs');

const p = '/app/public/_spa/assets/index-8qv-oyAx.js';
const c = fs.readFileSync(p, 'utf8');
const idx = c.indexOf('app-shell-fallback');
console.log(c.slice(idx + 1000, idx + 2500));
