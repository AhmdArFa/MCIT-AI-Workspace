const fs = require('fs');

const p = '/app/dist/desktop/assets/useScrollParent-Bq_xRQcM.js';
if (fs.existsSync(p)) {
  const c = fs.readFileSync(p, 'utf8');
  console.log('useScrollParent-Bq_xRQcM size:', c.length);

  // Search for "Request memory analysis" or empty state in this file
  let idx = c.indexOf('Request memory analysis');
  console.log('phrase at:', idx);
  if (idx !== -1) {
    console.log(c.slice(Math.max(0, idx - 200), idx + 300));
  } else {
    // Look for analysis or action
    let m = c.match(/analysis/gi);
    console.log('analysis occurrences:', m ? m.length : 0);
    // Print first 2000 chars of file
    console.log(c.slice(0, 1500));
  }
} else {
  console.log('File does not exist');
}
