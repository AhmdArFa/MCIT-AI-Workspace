const fs = require('fs');

const path = '/app/frontend/.next/server/app/notebooks.html';
const text = fs.readFileSync(path, 'utf8');

const mainIdx = text.indexOf('<main');
const mainEnd = text.indexOf('</main>');

if (mainIdx !== -1 && mainEnd !== -1) {
  console.log('=== MAIN HTML ===');
  console.log(text.slice(mainIdx, mainEnd + 7));
} else {
  console.log('No <main> tag found. Searching for Notebooks:');
  let idx = 0;
  while ((idx = text.indexOf('Notebooks', idx + 1)) !== -1) {
    console.log(text.slice(Math.max(0, idx - 50), Math.min(text.length, idx + 100)));
  }
}
