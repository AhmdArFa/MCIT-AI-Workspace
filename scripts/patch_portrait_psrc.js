const fs = require('fs');

const f = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
let c = fs.readFileSync(f, 'utf8');

if (c.includes('let i=n||pSrc;')) {
  c = c.replace('let i=n||pSrc;', 'let i=pSrc;');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Successfully patched hx in _layout-M7AKyzf6.js: let i=pSrc;');
} else {
  console.log('let i=n||pSrc; not found in _layout-M7AKyzf6.js');
}
