const fs = require('fs');
const path = require('path');

const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];
const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.venv', '__pycache__'];

function searchDir(dir, pattern, checkFn) {
  const results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (excludeDirs.includes(item)) continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results.push(...searchDir(full, pattern, checkFn));
      } else if (exts.includes(path.extname(item))) {
        const content = fs.readFileSync(full, 'utf8');
        if (pattern.test(content)) {
          if (!checkFn || checkFn(full, content)) {
            results.push(full);
          }
        }
      }
    }
  } catch (e) {}
  return results;
}

console.log('=== Scanning agent/packages/locales for Lobe ===');
const localeHits = searchDir('C:\\MCIT AI Final\\agent\\packages\\locales', /lobe/i, (f, c) => {
  // Ignore import statements or types if any
  const lines = c.split('\n');
  const matchedLines = lines.filter(l => /lobe/i.test(l) && !l.includes('@lobehub') && !l.includes('lobe-'));
  return matchedLines.length > 0;
});
localeHits.forEach(f => console.log('Locale hit:', f));

console.log('\n=== Scanning agent/src for user-facing Lobe strings ===');
const srcHits = searchDir('C:\\MCIT AI Final\\agent\\src', /lobe/i, (f, c) => {
  const lines = c.split('\n');
  const matchedLines = lines.filter(l => /lobe/i.test(l) && !l.includes('@lobehub') && !l.includes('lobe-') && !l.includes('from \'') && !l.includes('from "'));
  return matchedLines.length > 0;
});
srcHits.slice(0, 30).forEach(f => console.log('Src hit:', f));

console.log('\n=== Scanning frontend/src for Lobe ===');
const feHits = searchDir('C:\\MCIT AI Final\\frontend\\src', /lobe/i);
feHits.forEach(f => console.log('Frontend hit:', f));
