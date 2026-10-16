import subprocess

cmd = """
const fs = require('fs');

for (const f of ['_08gl7tk._.js', '_20lco-q._.js']) {
  const p = '/app/.next/server/chunks/' + f;
  const c = fs.readFileSync(p, 'utf8');
  const idx = c.indexOf('getFileItemById:K.input');
  console.log('=== ' + f + ' ===');
  console.log(c.substring(idx, idx + 250));
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
