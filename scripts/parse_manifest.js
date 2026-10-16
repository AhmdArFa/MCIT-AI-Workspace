const fs = require('fs');

const p = '/app/frontend/.next/server/app/(dashboard)/notebooks/page_client-reference-manifest.js';
const c = fs.readFileSync(p, 'utf8');

// Parse globalThis.__RSC_MANIFEST
const vm = require('vm');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(c, sandbox);

const manifest = sandbox.globalThis.__RSC_MANIFEST?.['/(dashboard)/notebooks/page'];
console.log('Manifest entry:', Object.keys(manifest || {}));
console.log('clientModules:');
for (const [k, v] of Object.entries(manifest?.clientModules || {})) {
  console.log(' ', k, '->', v.id, v.chunks);
}
