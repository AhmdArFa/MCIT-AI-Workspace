const fs = require('fs');

console.log('=== Busting Notebooks Client Chunk Cache ===');

const oldName = '06zn4uez7ei31.js';
const newName = '06zn4uez7ei31_v3.js';

const oldPath = '/app/frontend/.next/static/chunks/' + oldName;
const newPath = '/app/frontend/.next/static/chunks/' + newName;

if (fs.existsSync(oldPath)) {
  const content = fs.readFileSync(oldPath, 'utf8');
  fs.writeFileSync(newPath, content, 'utf8');
  console.log('[OK] Created cache-busted chunk:', newPath);
} else {
  console.error('[ERROR] Old chunk not found:', oldPath);
  process.exit(1);
}

// Update page_client-reference-manifest.js
const manifestPath = '/app/frontend/.next/server/app/(dashboard)/notebooks/page_client-reference-manifest.js';
if (fs.existsSync(manifestPath)) {
  let m = fs.readFileSync(manifestPath, 'utf8');
  if (m.includes(oldName)) {
    m = m.replaceAll(oldName, newName);
    fs.writeFileSync(manifestPath, m, 'utf8');
    console.log('[OK] Updated client-reference-manifest with new chunk name');
  } else if (m.includes(newName)) {
    console.log('[ALREADY] Manifest already points to', newName);
  } else {
    console.log('[WARN] Neither oldName nor newName found in manifest');
  }
}

console.log('=== Cache Busting Complete ===');
