const fs = require('fs');
const path = require('path');

function searchDir(dir, needle) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== 'node_modules' && ent.name !== '.git') {
          results.push(...searchDir(full, needle));
        }
      } else if (ent.isFile() && (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.json'))) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(needle)) {
            results.push(full);
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  return results;
}

const frontendDir = '/app/frontend';
console.log('Searching for MCIT AI...');
const mcitMatches = searchDir(frontendDir, 'MCIT AI');
console.log(`Found ${mcitMatches.length} files containing 'MCIT AI'`);
console.log(mcitMatches.slice(0, 15));

console.log('Searching for Tut Agent...');
const tutMatches = searchDir(frontendDir, 'Tut Agent');
console.log(`Found ${tutMatches.length} files containing 'Tut Agent'`);
console.log(tutMatches.slice(0, 15));
