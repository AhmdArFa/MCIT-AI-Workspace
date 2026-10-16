const fs = require('fs');

const p = '/app/dist/desktop/assets/app-const-BAiRd4u2.js';
const c = fs.readFileSync(p, 'utf8');

const end = c.slice(Math.max(0, c.length - 1500));
console.log('End of app-const:', end);
