const fs = require('fs');

const p = '/app/frontend/.next/static/chunks/2ih891jj9ldi0.js';
if (fs.existsSync(p)) {
  const c = fs.readFileSync(p, 'utf8');
  console.log('2ih891jj9ldi0 size:', c.length);
  console.log('Includes Open in a new window:', c.includes('Open in a new window'));
}
