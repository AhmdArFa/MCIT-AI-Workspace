const fs = require('fs');
const content = fs.readFileSync('/app/frontend/.next/static/chunks/06zn4uez7ei31.js', 'utf8');
const p = content.indexOf('e.s(["default",0,function()');
const end = content.indexOf('],62030)', p);
console.log(content.slice(p, end + 8));
