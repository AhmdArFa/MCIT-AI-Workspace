const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else if (ent.isFile()) {
      let txt = fs.readFileSync(full, 'utf8');
      let changed = false;
      const replacements = [
        ['MCIT AI account', 'TuT AI account'],
        ['MCIT AI', 'TuT AI'],
        ['MCIT', 'TuT'],
        ['Tut Agent', 'TuT Agent'],
        ['Tut AI', 'TuT AI'],
        ['Lobe Theme', 'TuT Theme'],
        ['LobeHub', 'TuT AI'],
      ];
      for (const [from, to] of replacements) {
        if (txt.includes(from)) {
          txt = txt.replaceAll(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, txt, 'utf8');
        console.log('Patched file:', full);
      }
    }
  }
}

console.log('Walking /app/.next/server/route-cache ...');
walk('/app/.next/server/route-cache');
console.log('Done patching route-cache.');
