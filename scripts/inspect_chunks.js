const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(full, pattern);
    } else if (entry.name.endsWith('.js')) {
      try {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes(pattern)) {
          console.log(`Found "${pattern}" in: ${full}`);
        }
      } catch (e) {}
    }
  }
}

console.log('Searching for target in /app/public and /app/dist...');
searchDir('/app/public', 'findById=async(e,s={})=>{let{accessScope:a=');
searchDir('/app/dist', 'findById=async(e,s={})=>{let{accessScope:a=');
console.log('Done.');
