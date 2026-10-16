const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dirs = [
  '/app/public/_spa/assets',
  '/app/dist/desktop/assets',
  '/app/dist/mobile/assets'
];

let total = 0;
let errors = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const f of files) {
    total++;
    const full = path.join(dir, f);
    try {
      const code = fs.readFileSync(full, 'utf8');
      new vm.SourceTextModule(code, { initializeImportMeta() {} });
    } catch (err) {
      console.error(`[SYNTAX ERROR] ${full}: ${err.message}`);
      errors++;
    }
  }
}

console.log(`Validation complete. Tested ${total} JS files across all assets. Total errors: ${errors}`);
