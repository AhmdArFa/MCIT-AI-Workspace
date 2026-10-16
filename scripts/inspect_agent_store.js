const fs = require('fs');

const f = '/app/dist/desktop/assets/index-8qv-oyAx.js';
const c = fs.readFileSync(f, 'utf8');
const idx = c.indexOf('builtinAgentIdMap');
console.log('builtinAgentIdMap in index:');
if (idx !== -1) {
  console.log(c.slice(idx - 50, idx + 200));
}
