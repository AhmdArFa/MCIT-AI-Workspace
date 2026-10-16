const fs = require('fs');

const p = '/app/dist/desktop/assets/(home)-DA109CZ7.js';
if (fs.existsSync(p)) {
  const c = fs.readFileSync(p, 'utf8');
  console.log('(home) chunk size:', c.length);
  console.log(c.slice(0, 3000));
} else {
  console.log('File does not exist');
}
