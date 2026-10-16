const fs = require('fs');

const files = [
  '/app/.next/server/chunks/_09gn3lj._.js',
  '/app/.next/server/chunks/_0gimfm8._.js',
  '/app/.next/server/chunks/_0tnht14._.js'
];

for (const f of files) {
  let txt = fs.readFileSync(f, 'utf8');
  txt = txt.replaceAll('"LobeHub-Market-SDK/0.31.3"', '"TuT-Market-SDK/0.31.3"');
  fs.writeFileSync(f, txt, 'utf8');
  console.log('Patched User-Agent in:', f);
}
