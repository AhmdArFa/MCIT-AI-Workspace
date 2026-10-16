const fs = require('fs');

const p = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(p, 'utf8');

console.log(c.slice(169750, 171500));
