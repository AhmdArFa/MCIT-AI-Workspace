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
        if (ent.name !== 'node_modules' && ent.name !== '.git') {
          walk(full);
        }
      } else if (ent.isFile() && (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.json') || ent.name.endsWith('.txt'))) {
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

const frontendDir = '/app/frontend/.next';
const replacements = [
  ['MCIT AI', 'TuT AI'],
  ['Tut Agent', 'TuT Agent'],
  ['Tut AI', 'TuT AI'],
  ['Ask Tut to work', 'Ask TuT to work'],
  ['Ask Tut Agent', 'Ask TuT Agent'],
  ['Connect Tut Agent', 'Connect TuT Agent'],
  ['Tut Agent is not connected', 'TuT Agent is not connected'],
  ['Instructions for Tut Agent', 'Instructions for TuT Agent'],
  ['Instructions for Tut', 'Instructions for TuT'],
  ['Tut enters them', 'TuT enters them'],
  ['Open Tut Agent', 'Open TuT Agent'],
  ['Opened Tut Agent', 'Opened TuT Agent'],
  ['Created a Tut Agent token', 'Created a TuT Agent token'],
  ['No Tut Agent chats', 'No TuT Agent chats'],
  ['No files in Tut Agent', 'No files in TuT Agent'],
  ['No Tut Agent usage', 'No TuT Agent usage'],
  ['Tut chats', 'TuT chats'],
  ['Tut files', 'TuT files'],
  ['Tut generations', 'TuT generations'],
  ['Tut tokens', 'TuT tokens'],
  ['Tut answers from', 'TuT answers from'],
];

console.log('=== Starting Rebranding in mcit-ai container ===');
replaceInDir(frontendDir, replacements);
console.log('=== Rebranding in mcit-ai container Complete ===');
