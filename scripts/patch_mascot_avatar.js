const fs = require('fs');
const path = require('path');

const targetAvatar = '/avatars/mcit/tutankhamun.webp';

function patchInDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      patchInDir(full);
    } else if (item.endsWith('.js') || item.endsWith('.json')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      if (content.includes('AAABAAEAMDAAAAAAIABEFAAAFgAAAIlQTkcNChoK')) {
        const regex = /data:image\/x-icon;base64,AAABAAEAMDAAAAAAIABEFAAAFgAAAIlQTkcNChoK[A-Za-z0-9+/=]+/g;
        content = content.replace(regex, targetAvatar);
        changed = true;
      }
      if (content.includes('"name":"mcit"') && content.includes('BuiltinSkillManifest')) {
        content = content.replaceAll('"name":"mcit"', '"name":"TuT AI"');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`[PATCHED] ${path.relative('/app', full)}`);
      }
    }
  }
}

console.log('Patching everything in /app...');
patchInDir('/app/.next');
patchInDir('/app/dist');
patchInDir('/app/public');
console.log('Done patching mascot avatar.');
