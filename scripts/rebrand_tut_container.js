const fs = require('fs');
const path = require('path');

function replaceInDir(dir, replacements) {
  let count = 0;
  let fileCount = 0;

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== 'node_modules' && ent.name !== '.git' && ent.name !== '.pnpm') {
          walk(full);
        }
      } else if (ent.isFile() && (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.json') || ent.name.endsWith('.ts') || ent.name.endsWith('.tsx'))) {
        try {
          let content = fs.readFileSync(full, 'utf8');
          let modified = false;

          for (const [from, to] of replacements) {
            if (content.includes(from)) {
              content = content.replaceAll(from, to);
              modified = true;
            }
          }

          if (modified) {
            fs.writeFileSync(full, content, 'utf8');
            fileCount++;
          }
        } catch (e) {
          console.error('Error on file', full, e.message);
        }
      }
    }
  }

  walk(dir);
  console.log(`Replaced strings in ${fileCount} files in ${dir}`);
}

const targetDirs = [
  '/app/public',
  '/app/dist',
  '/app/.next',
  '/app/src',
  '/app/packages'
];

const replacements = [
  ['MCIT AI', 'TuT AI'],
  ['Tut Agent', 'TuT Agent'],
  ['Tut AI', 'TuT AI'],
  ['How may Tut guide', 'How may TuT guide'],
  ['Ask Tut to work', 'Ask TuT to work'],
  ['Ask Tut', 'Ask TuT'],
  ['Welcome to Tut', 'Welcome to TuT'],
  ['Tut is your', 'TuT is your']
];

console.log('=== Starting Rebranding in tut-agent container ===');
for (const d of targetDirs) {
  if (fs.existsSync(d)) {
    replaceInDir(d, replacements);
  }
}
console.log('=== Rebranding in tut-agent container Complete ===');
