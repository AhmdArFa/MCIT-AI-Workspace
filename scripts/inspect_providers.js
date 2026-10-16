const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const full = path.join(dir, f);
    try {
      const content = fs.readFileSync(full, 'utf8');
      const regex1 = /id:\s*"([a-zA-Z0-9_-]+)",[^}]{0,150}enabled:\s*(!0|true)/g;
      let match;
      while ((match = regex1.exec(content)) !== null) {
        console.log(`[${f}] Provider id: ${match[1]} enabled: ${match[2]}`);
      }
      const regex2 = /enabled:\s*(!0|true),[^}]{0,150}id:\s*"([a-zA-Z0-9_-]+)"/g;
      while ((match = regex2.exec(content)) !== null) {
        console.log(`[${f}] Provider id: ${match[2]} enabled: ${match[1]}`);
      }
    } catch (e) {}
  }
}

console.log('--- Server Chunks ---');
checkDir('/app/.next/server/chunks');
console.log('--- Desktop Assets ---');
checkDir('/app/dist/desktop/assets');
