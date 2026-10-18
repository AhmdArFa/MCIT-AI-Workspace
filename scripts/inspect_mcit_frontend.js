const fs = require('fs');

console.log('=== Inspecting 0hhmym6v1sf1-.js ===');
const staticChunk = fs.readFileSync('/app/frontend/.next/static/chunks/0hhmym6v1sf1-.js', 'utf8');
const sIdx = staticChunk.indexOf('What to create');
console.log('Static chunk "What to create" at:', sIdx);
if (sIdx !== -1) {
  console.log(staticChunk.slice(sIdx - 50, sIdx + 700));
}

console.log('=== Inspecting SSR Chunk ===');
const ssrChunk = fs.readFileSync('/app/frontend/.next/server/chunks/ssr/src_app_(dashboard)_notebooks_[id]_page_tsx_08glb8y._.js', 'utf8');
const ssrIdx = ssrChunk.indexOf('What to create');
console.log('SSR chunk "What to create" at:', ssrIdx);
if (ssrIdx !== -1) {
  console.log(ssrChunk.slice(ssrIdx - 50, ssrIdx + 700));
}
