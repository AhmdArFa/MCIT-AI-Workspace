const fs = require('fs');

const chunkPath = '/app/frontend/.next/static/chunks/06zn4uez7ei31.js';
const content = fs.readFileSync(chunkPath, 'utf8');

const needle = '62030,';
const idx = content.indexOf(needle);
console.log('Index of 62030,:', idx);

if (idx !== -1) {
  // Let's see the preamble of module 62030
  const endModule = content.indexOf('62030)},', idx);
  console.log('End of 62030:', endModule);
  console.log('--- Full module 62030 ---');
  console.log(content.slice(idx, endModule + 7));
}
