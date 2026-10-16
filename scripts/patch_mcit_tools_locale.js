const fs = require('fs');
const path = require('path');

function patchAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      patchAll(full);
    } else if (item.endsWith('.js') || item.endsWith('.json')) {
      let c = fs.readFileSync(full, 'utf8');
      let changed = false;

      // 1. tools.builtins.mcit.title
      if (c.includes('"tools.builtins.mcit.title":"MCIT AI"') || c.includes("'tools.builtins.mcit.title': 'MCIT AI'") || c.includes("'tools.builtins.mcit.title':\"MCIT AI\"")) {
        c = c.replaceAll('"tools.builtins.mcit.title":"MCIT AI"', '"tools.builtins.mcit.title":"TuT AI"');
        c = c.replaceAll("'tools.builtins.mcit.title': 'MCIT AI'", "'tools.builtins.mcit.title': 'TuT AI'");
        c = c.replaceAll("'tools.builtins.mcit.title':\"MCIT AI\"", "'tools.builtins.mcit.title':\"TuT AI\"");
        changed = true;
      }

      // 2. skillStore.tabs.mcit
      if (c.includes('"skillStore.tabs.mcit":"MCIT AI"') || c.includes("'skillStore.tabs.mcit': 'MCIT AI'") || c.includes("'skillStore.tabs.mcit':\"MCIT AI\"")) {
        c = c.replaceAll('"skillStore.tabs.mcit":"MCIT AI"', '"skillStore.tabs.mcit":"TuT Platform"');
        c = c.replaceAll("'skillStore.tabs.mcit': 'MCIT AI'", "'skillStore.tabs.mcit': 'TuT Platform'");
        c = c.replaceAll("'skillStore.tabs.mcit':\"MCIT AI\"", "'skillStore.tabs.mcit':\"TuT Platform\"");
        changed = true;
      }

      // 3. In AgentTool chunks: if item.name === 'mcit' or item.identifier === 'mcit'
      if (full.includes('AgentTool-TDriUQoN.js')) {
        // Ensure mcit tool label displays TuT AI instead of mcit
        if (c.includes('label:e.meta?.title') && !c.includes('e.identifier===`mcit`?`TuT AI`')) {
          c = c.replaceAll('label:e.meta?.title', 'label:e.identifier===`mcit`?`TuT AI`:e.meta?.title');
          c = c.replaceAll('label:e.name', 'label:e.identifier===`mcit`?`TuT AI`:e.name');
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(full, c, 'utf8');
        console.log(`[PATCHED] ${path.relative('/app', full)}`);
      }
    }
  }
}

console.log('Patching mcit tool locales and titles...');
patchAll('/app/.next');
patchAll('/app/dist');
patchAll('/app/public');
console.log('Finished patching tool locales.');
