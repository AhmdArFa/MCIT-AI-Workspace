const fs = require('fs');
const content = fs.readFileSync('/app/frontend/.next/server/app/(dashboard)/notebooks/page_client-reference-manifest.js', 'utf8');
const matches = content.match(/\/_next\/static\/chunks\/[^"]+/g);
const unique = Array.from(new Set(matches || []));
console.log('Referenced chunks for /(dashboard)/notebooks/page:');
for (const c of unique) {
  console.log(c);
}
