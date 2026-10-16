const fs = require('fs');
const path = require('path');

const chunksDir = '/app/frontend/.next/static/chunks';
const serverDir = '/app/frontend/.next/server';

const srcChunk = path.join(chunksDir, '06zn4uez7ei31.js');
const targetChunk = path.join(chunksDir, '06zn4uez7ei31_v6.js');

if (!fs.existsSync(srcChunk)) {
  console.error('Source chunk does not exist:', srcChunk);
  process.exit(1);
}

let chunkCode = fs.readFileSync(srcChunk, 'utf8');

// Ensure no syntax error
chunkCode = chunkCode.replace('}], 62030)}},29288', '}], 62030)},29288');
fs.writeFileSync(srcChunk, chunkCode);
fs.writeFileSync(targetChunk, chunkCode);
console.log('Saved', targetChunk, 'size:', chunkCode.length);

// Verify with acorn
try {
  const acorn = require('acorn');
  acorn.parse(chunkCode, { ecmaVersion: 2022 });
  console.log('Chunk verified syntax OK!');
} catch (e) {
  console.error('Syntax error still present:', e);
  process.exit(1);
}

// Replace references in .next/server
function walkAndReplace(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndReplace(fullPath);
    } else if (entry.isFile()) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        if (content.includes('06zn4uez7ei31.js')) {
          content = content.replaceAll('06zn4uez7ei31.js', '06zn4uez7ei31_v6.js');
          modified = true;
        }
        if (content.includes('06zn4uez7ei31_v3.js')) {
          content = content.replaceAll('06zn4uez7ei31_v3.js', '06zn4uez7ei31_v6.js');
          modified = true;
        }
        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log('Updated references in:', fullPath);
        }
      } catch (err) {
        // binary file or read error, ignore
      }
    }
  }
}

walkAndReplace(serverDir);
console.log('All server references replaced with 06zn4uez7ei31_v6.js');
