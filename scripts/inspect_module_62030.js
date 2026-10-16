const fs = require('fs');

const chunkPath = '/app/frontend/.next/static/chunks/06zn4uez7ei31.js';
const content = fs.readFileSync(chunkPath, 'utf8');

const needle = 'e.s(["default",0,function()';
const start = content.indexOf(needle);
console.log('Start index:', start);

if (start !== -1) {
  const end = content.indexOf('62030);', start);
  console.log('End index:', end);
  if (end !== -1) {
    console.log('Module 62030 code:');
    console.log(content.slice(start, end + 8));
  } else {
    console.log(content.slice(start, start + 3000));
  }
}
