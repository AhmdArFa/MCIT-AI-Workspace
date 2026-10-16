import subprocess

cmd = """
const path = require('path');
// Load the chunk that defines FileModel
// We know it is in /app/.next/server/chunks/packages_0g91f51._.js or similar
const fs = require('fs');

async function test() {
  const p = '/app/.next/server/chunks/packages_0g91f51._.js';
  const c = fs.readFileSync(p, 'utf8');
  console.log('Chunk length:', c.length);
}
test().catch(e => console.error(e));
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
