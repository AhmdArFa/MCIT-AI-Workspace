const fs = require('fs');

const p = '/app/dist/desktop/assets/AgentSettings-B-mZgSxv.js';
if (fs.existsSync(p)) {
  const c = fs.readFileSync(p, 'utf8');
  console.log('AgentSettings size:', c.length);
  // Search for disabled
  let count = 0;
  let idx = 0;
  while ((idx = c.indexOf('disabled:', idx)) !== -1) {
    count++;
    if (count <= 15) {
      console.log(`disabled: at ${idx}:`, c.slice(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
    }
    idx += 9;
  }
  console.log('Total disabled occurrences:', count);
} else {
  console.log('File does not exist');
}
