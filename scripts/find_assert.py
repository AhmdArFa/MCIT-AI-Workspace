import subprocess

cmd = """
const fs = require('fs');
const c = fs.readFileSync('/app/.next/server/chunks/_08gl7tk._.js', 'utf8');
const idx = c.indexOf('assertFileNotInRestrictedKnowledgeBase');
if (idx !== -1) {
  console.log(c.substring(idx - 50, idx + 400));
} else {
  console.log('Not found by name, searching F=');
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
