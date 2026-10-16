const fs = require('fs');
const path = require('path');

function searchChunk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      results.push(...searchChunk(full));
    } else if (f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.html')) {
      const c = fs.readFileSync(full, 'utf8');
      const matches = c.match(/(?:LobeChat|LobeHub|LobeAgent|Lobe|lobe-chat)/g);
      if (matches) {
        for (const m of new Set(matches)) {
          let idx = 0;
          while ((idx = c.indexOf(m, idx)) !== -1) {
            const snippet = c.slice(Math.max(0, idx - 40), Math.min(c.length, idx + m.length + 40));
            if (!snippet.includes('node_modules/@lobehub') && !snippet.includes('@lobehub/')) {
              results.push({ file: full, match: m, snippet });
              break;
            }
            idx += m.length;
          }
        }
      }
    }
  }
  return results;
}

for (const d of ['/app/dist/desktop', '/app/public/_spa', '/app/public/_spa-workbench', '/app/public/_spa-share', '/app/public/_spa-auth']) {
  console.log('Searching ' + d);
  const hits = searchChunk(d);
  hits.forEach(h => {
    console.log(`[${h.match}] in ${path.relative(d, h.file)}:\n  "...${h.snippet.replace(/\n/g, ' ')}..."`);
  });
}
