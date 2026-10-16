const fs = require('fs');
const path = require('path');

function search(dir, term) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === 'node_modules') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      search(full, term);
    } else if (ent.name.endsWith('.js')) {
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(term)) {
          console.log(`Found "${term}" in: ${full}`);
        }
      } catch (_) {}
    }
  }
}

search('/app/frontend/.next', 'RefreshCw');
