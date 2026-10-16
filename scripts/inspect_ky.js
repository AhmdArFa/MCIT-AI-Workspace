const fs = require('fs');

const chunkPath = '/app/frontend/.next/static/chunks/06zn4uez7ei31.js';
const content = fs.readFileSync(chunkPath, 'utf8');

const needle = '62030,e=>{';
const start = content.indexOf(needle);
console.log('Start of 62030 body:', start);

const end = content.indexOf('var w=e.i(68834)', start);
console.log(content.slice(start, end));
