const fs = require('fs');

const m = fs.readFileSync('/app/dist/desktop/assets/memory-D1rUlmdl.js', 'utf8');
const idx1 = m.indexOf('manage_settings');
console.log('manage_settings at:', idx1, m.slice(idx1 - 40, idx1 + 40));

const a = fs.readFileSync('/app/dist/desktop/assets/AgentSettings-B-mZgSxv.js', 'utf8');
const idx2 = a.indexOf('edit_own_content');
console.log('edit_own_content at:', idx2, a.slice(idx2 - 40, idx2 + 40));
