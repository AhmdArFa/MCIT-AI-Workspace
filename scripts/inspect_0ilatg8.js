const fs = require('fs');

const f1 = '/app/frontend/.next/server/chunks/ssr/src_0ilatg8._.js';
const f2 = '/app/frontend/.next/static/chunks/3nzuklh9ftq7i.js';

if (fs.existsSync(f1)) {
  const c = fs.readFileSync(f1, 'utf8');
  console.log('f1 size:', c.length);
  const idx = c.indexOf('RefreshCw');
  console.log('f1 RefreshCw at', idx, ':', c.slice(idx - 100, idx + 200));
}

if (fs.existsSync(f2)) {
  const c = fs.readFileSync(f2, 'utf8');
  console.log('f2 size:', c.length);
  const idx = c.indexOf('RefreshCw');
  console.log('f2 RefreshCw at', idx, ':', c.slice(idx - 100, idx + 200));
}
