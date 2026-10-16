const fs = require('fs');
const path = require('path');

function searchAll(dir, term) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const p = path.join(dir, f);
    try {
      const c = fs.readFileSync(p, 'utf8');
      const idx = c.indexOf(term);
      if (idx !== -1) {
        console.log(`[${f}] found '${term}' at ${idx}. Snippet:`);
        console.log(c.slice(Math.max(0, idx - 80), Math.min(c.length, idx + 180)));
        console.log('---');
      }
    } catch (e) {}
  }
}

console.log('--- Searching for ollama in chunks ---');
searchAll('/app/.next/server/chunks', 'ollama');

console.log('--- Searching for id: "openai" in chunks ---');
searchAll('/app/.next/server/chunks', 'id: "openai"');
