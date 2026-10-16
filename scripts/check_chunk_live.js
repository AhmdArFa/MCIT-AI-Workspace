const fs = require('fs');

const p = '/app/frontend/.next/static/chunks/06zn4uez7ei31.js';
const c = fs.readFileSync(p, 'utf8');

console.log('Size:', c.length);
console.log('Includes ACCENT_PRESETS:', c.includes('ACCENT_PRESETS'));
console.log('Includes NotebookCard:', c.includes('NotebookCard'));
console.log('Includes Developed by Eng Ahmed Arfa:', c.includes('Developed by Eng Ahmed Arfa'));
