const fs = require('fs');

const p = '/app/dist/desktop/assets/userMemory-DzFH7LHK.js';
const c = fs.readFileSync(p, 'utf8');

const idx = c.indexOf('requestFromChatTopics');
console.log('requestFromChatTopics at:', idx);
if (idx !== -1) {
  console.log(c.slice(idx - 100, idx + 400));
}
