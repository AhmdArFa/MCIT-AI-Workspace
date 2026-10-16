import subprocess

cmd = """
const fs = require('fs');
const files = fs.readdirSync('/app/.next/server/chunks');
for (const f of files) {
  if (!f.endsWith('.js')) continue;
  const c = fs.readFileSync('/app/.next/server/chunks/' + f, 'utf8');
  if (c.includes('712261')) {
    console.log('Found 712261 in:', f);
  }
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
