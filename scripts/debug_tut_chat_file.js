const fs = require('fs');

const f = '/app/public/_spa/assets/store-BOOyOr6z.js';
const code = fs.readFileSync(f, 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('updateFile', idx)) !== -1) {
  matches.push(code.substring(Math.max(0, idx - 50), idx + 200));
  idx += 10;
}
console.log('Matches for updateFile:', matches.length);
matches.slice(0, 5).forEach((m, i) => console.log(`[${i}]`, m));
