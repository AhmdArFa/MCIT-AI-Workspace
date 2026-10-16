const fs = require('fs');

console.log('=== Busting Tut Client Chunk Cache ===');

const oldName = '2ih891jj9ldi0.js';
const newName = '2ih891jj9ldi0_v3.js';

const oldPath = '/app/frontend/.next/static/chunks/' + oldName;
const newPath = '/app/frontend/.next/static/chunks/' + newName;

if (fs.existsSync(oldPath)) {
  const content = fs.readFileSync(oldPath, 'utf8');
  fs.writeFileSync(newPath, content, 'utf8');
  console.log('[OK] Created cache-busted tut chunk:', newPath);
}

// Update tut page_client-reference-manifest.js
const manifestPath = '/app/frontend/.next/server/app/(dashboard)/tut/page_client-reference-manifest.js';
if (fs.existsSync(manifestPath)) {
  let m = fs.readFileSync(manifestPath, 'utf8');
  if (m.includes(oldName)) {
    m = m.replaceAll(oldName, newName);
    fs.writeFileSync(manifestPath, m, 'utf8');
    console.log('[OK] Updated tut manifest with new chunk name');
  } else if (m.includes(newName)) {
    console.log('[ALREADY] Tut manifest already points to', newName);
  }
}

console.log('=== Tut Cache Busting Complete ===');
