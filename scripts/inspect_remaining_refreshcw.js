const fs = require('fs');

const files = [
  '/app/frontend/.next/server/chunks/ssr/[root-of-the-server]__1omt17j._.js',
  '/app/frontend/.next/static/chunks/0odurod3gct6e.js',
  '/app/frontend/.next/static/chunks/0rj3-xrv0173o.js',
  '/app/frontend/.next/static/chunks/2qwwxmocbu140.js'
];

for (const p of files) {
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    console.log(p, 'size:', c.length);
    let idx = c.indexOf('RefreshCw');
    while (idx !== -1) {
      console.log('  RefreshCw at', idx, ':', c.slice(Math.max(0, idx - 60), idx + 120));
      idx = c.indexOf('RefreshCw', idx + 10);
    }
  }
}
