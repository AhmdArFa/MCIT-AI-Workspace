const fs = require('fs');

const p = '/app/dist/desktop/assets/userMemory-DzFH7LHK.js';
const c = fs.readFileSync(p, 'utf8');

// Let's search for "Request memory analysis" or its translation key
const idx = c.indexOf('Request memory analysis');
console.log('Request memory analysis at:', idx);
if (idx === -1) {
  // Let's search for translation keys like 'requestAnalysis' or 'analysis'
  let matches = c.match(/[a-zA-Z0-9_.]*(?:analysis|Analysis|memories|Memories)[a-zA-Z0-9_.]*/g);
  console.log('Matches:', matches ? Array.from(new Set(matches)).slice(0, 20) : 'none');
} else {
  console.log(c.slice(Math.max(0, idx - 200), idx + 300));
}
