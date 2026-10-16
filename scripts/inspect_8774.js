const fs = require('fs');

const p = '/app/frontend/.next/server/chunks/ssr/[root-of-the-server]__0l6yw52._.js';
const c = fs.readFileSync(p, 'utf8');

console.log('Size:', c.length);
const idx = c.indexOf('8774');
console.log('8774 at:', idx);
console.log(c.slice(idx - 50, idx + 400));
