const fs = require('fs');
const path = require('path');

const targets = ['/app/.next', '/app/dist', '/app/public'];

let replacedCount = 0;

function purgeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      purgeDir(full);
    } else if (item.endsWith('.js') || item.endsWith('.json') || item.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;

      // 1. Lobe Theme -> TuT Theme
      if (content.includes('displayName:`Lobe Theme`') || content.includes('displayName:"Lobe Theme"')) {
        content = content.replaceAll('displayName:`Lobe Theme`', 'displayName:`TuT Theme`');
        content = content.replaceAll('displayName:"Lobe Theme"', 'displayName:"TuT Theme"');
        changed = true;
      }
      if (content.includes('displayName:`MCIT Theme`') || content.includes('displayName:"MCIT Theme"')) {
        content = content.replaceAll('displayName:`MCIT Theme`', 'displayName:`TuT Theme`');
        content = content.replaceAll('displayName:"MCIT Theme"', 'displayName:"TuT Theme"');
        changed = true;
      }

      // 2. Provider option LobeHub -> TuT AI
      if (content.includes('fullTitle:`LobeHub`') || content.includes('fullTitle:"LobeHub"')) {
        content = content.replaceAll('fullTitle:`LobeHub`', 'fullTitle:`TuT AI`');
        content = content.replaceAll('fullTitle:"LobeHub"', 'fullTitle:"TuT AI"');
        changed = true;
      }
      if (content.includes('id:`LobeHub`') || content.includes('id:"LobeHub"')) {
        content = content.replaceAll('id:`LobeHub`', 'id:`TuT AI`');
        content = content.replaceAll('id:"LobeHub"', 'id:"TuT AI"');
        changed = true;
      }

      // 3. Editor debug status
      if (content.includes('LobeHub Editor Debug Status')) {
        content = content.replaceAll('LobeHub Editor Debug Status', 'TuT AI Editor Debug Status');
        changed = true;
      }

      // 4. Standalone string `LobeHub` or `LobeChat`
      if (content.includes('`LobeHub`') || content.includes('"LobeHub"')) {
        content = content.replaceAll('`LobeHub`', '`TuT AI`');
        content = content.replaceAll('"LobeHub"', '"TuT AI"');
        changed = true;
      }
      if (content.includes('`LobeChat`') || content.includes('"LobeChat"')) {
        content = content.replaceAll('`LobeChat`', '`TuT AI`');
        content = content.replaceAll('"LobeChat"', '"TuT AI"');
        changed = true;
      }

      // 5. MCIT AI branding in remaining user-facing titles -> TuT AI
      if (content.includes('`MCIT AI`') || content.includes('"MCIT AI"')) {
        content = content.replaceAll('`MCIT AI`', '`TuT AI`');
        content = content.replaceAll('"MCIT AI"', '"TuT AI"');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`[PURGED] ${path.relative('/app', full)}`);
        replacedCount++;
      }
    }
  }
}

console.log('Purging Lobe brand and leftover MCIT brand in all assets...');
targets.forEach(t => purgeDir(t));
console.log(`Purged ${replacedCount} files successfully.`);
