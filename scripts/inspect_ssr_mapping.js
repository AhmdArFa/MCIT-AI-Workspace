const fs = require('fs');

const p = '/app/frontend/.next/server/app/(dashboard)/notebooks/page_client-reference-manifest.js';
const c = fs.readFileSync(p, 'utf8');

const vm = require('vm');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(c, sandbox);

const manifest = sandbox.globalThis.__RSC_MANIFEST?.['/(dashboard)/notebooks/page'];
console.log('ssrModuleMapping:');
for (const [k, v] of Object.entries(manifest?.ssrModuleMapping || {})) {
  console.log(' ', k, '->', v);
}
