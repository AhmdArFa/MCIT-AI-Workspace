const fs = require('fs');

const p = '/app/.next/server/chunks/_0dwqyps._.js';
const code = fs.readFileSync(p, 'utf8');

const target = 's=await this._runtime.generateObject(e,n)';
const idx = code.indexOf(target);
console.log('Index:', idx);
console.log('Before:', code.substring(idx - 100, idx));
console.log('Target:', code.substring(idx, idx + target.length));
console.log('After:', code.substring(idx + target.length, idx + target.length + 100));
