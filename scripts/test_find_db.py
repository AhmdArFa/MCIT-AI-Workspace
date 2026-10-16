import subprocess

cmd = """
// Let's inspect serverDB in Next.js
const fs = require('fs');

async function test() {
  // Let's find where serverDB is created in server chunks
  const files = fs.readdirSync('/app/.next/server/chunks');
  for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const c = fs.readFileSync('/app/.next/server/chunks/' + f, 'utf8');
    if (c.includes('getServerDB') && c.includes('db-adaptor')) {
      console.log('Found getServerDB in:', f);
    }
  }
}
test().catch(console.error);
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
