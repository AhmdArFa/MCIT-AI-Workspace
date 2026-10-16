const fs = require('fs');

const f = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';
const c = fs.readFileSync(f, 'utf8');
let idx = 0;
while ((idx = c.indexOf('HomeEditorInput', idx)) !== -1) {
  console.log('HomeEditorInput at', idx);
  console.log(c.slice(Math.max(0, idx - 100), idx + 200));
  idx += 15;
}

// Also check imports of EditorInput
idx = c.indexOf('EditorInput-BJlPxKuV');
if (idx !== -1) {
  const impIdx = c.indexOf('()=>import("./EditorInput-BJlPxKuV', idx - 2000);
  console.log('Import around:', c.slice(Math.max(0, idx - 100), idx + 200));
}
