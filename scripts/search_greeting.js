const fs = require('fs');
const path = require('path');

function searchAll(dir, pattern) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchAll(full, pattern);
    } else if (entry.isFile() && (full.endsWith('.js') || full.endsWith('.html') || full.endsWith('.json'))) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(pattern)) {
          console.log(`Found pattern in: ${full}`);
          const idx = content.indexOf(pattern);
          console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
          console.log('===');
        }
      } catch (e) {}
    }
  }
}

searchAll('/app', 'What would you like to work on?');
