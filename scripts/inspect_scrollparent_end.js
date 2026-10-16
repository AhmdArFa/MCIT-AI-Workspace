const fs = require('fs');

const p = '/app/dist/desktop/assets/useScrollParent-Bq_xRQcM.js';
const c = fs.readFileSync(p, 'utf8');

console.log(c.slice(5000));
