const fs = require('fs');

const f1 = '/app/frontend/.next/static/chunks/1gwdbtf6zwrxc.js';
const f2 = '/app/frontend/.next/static/chunks/3xaap_x_7xbdw.js';

if (fs.existsSync(f1)) {
  const c1 = fs.readFileSync(f1, 'utf8');
  console.log('f1 size:', c1.length);
  const idx = c1.indexOf('activeNotebooks');
  console.log('f1 snippet at', idx, ':', c1.slice(Math.max(0, idx - 100), idx + 200));
}

if (fs.existsSync(f2)) {
  const c2 = fs.readFileSync(f2, 'utf8');
  console.log('f2 size:', c2.length);
  const idx = c2.indexOf('activeNotebooks');
  console.log('f2 snippet at', idx, ':', c2.slice(Math.max(0, idx - 100), idx + 200));
}
