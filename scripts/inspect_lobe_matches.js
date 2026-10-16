const fs = require('fs');

const files = [
  '/app/.next/server/chunks/_09gn3lj._.js',
  '/app/.next/server/chunks/_0gimfm8._.js',
  '/app/.next/server/chunks/_0tnht14._.js'
];

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  console.log(`=== ${f} ===`);
  for (const needle of ['Lobe Theme', 'LobeHub']) {
    let idx = txt.indexOf(needle);
    while (idx !== -1) {
      console.log(`Match "${needle}":`, txt.substring(Math.max(0, idx - 40), Math.min(txt.length, idx + 80)));
      idx = txt.indexOf(needle, idx + 1);
    }
  }
}
