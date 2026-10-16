const fs = require('fs');

const chunks = [
  '/app/.next/server/chunks/_08gl7tk._.js',
  '/app/.next/server/chunks/_0cjhpa1._.js',
  '/app/.next/server/chunks/_0dyd9kv._.js',
  '/app/.next/server/chunks/_1-7e7f1._.js',
  '/app/.next/server/chunks/_1d5rqqd._.js',
  '/app/.next/server/chunks/_1zpesk7._.js',
  '/app/.next/server/chunks/_20lco-q._.js'
];

for (const c of chunks) {
  if (fs.existsSync(c)) {
    const text = fs.readFileSync(c, 'utf8');
    const idx = text.indexOf('getFileItemById');
    if (idx !== -1) {
      console.log('=== ' + c + ' ===');
      console.log(text.slice(idx - 50, idx + 400));
    }
  }
}
