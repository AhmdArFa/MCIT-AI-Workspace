const fs = require('fs');

const p = '/app/frontend/.next/server/app/(dashboard)/notebooks/page.js';
console.log(fs.readFileSync(p, 'utf8'));
