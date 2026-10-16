const fs = require('fs');
const path = require('path');

function search(dir, term) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      search(full, term);
    } else if (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.json')) {
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(term)) {
          console.log(`Found "${term}" in: ${full}`);
        }
      } catch (_) {}
    }
  }
}

console.log('Searching /app/frontend/.next for "notebooks.activeNotebooks"...');
search('/app/frontend/.next', 'notebooks.activeNotebooks');

console.log('Searching /app/frontend/.next for "notebooks.newNotebook"...');
search('/app/frontend/.next', 'notebooks.newNotebook');
