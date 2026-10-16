import subprocess

cmd = """
const fs = require('fs');
const c = fs.readFileSync('/app/.next/server/chunks/_08gl7tk._.js', 'utf8');

// Find all require or import in _08gl7tk._.js that define g
const idx = c.indexOf('fileModel:new g.FileModel');
// Let's find g.FileModel anywhere before that
const matches = [...c.substring(0, idx).matchAll(/([a-zA-Z0-9_$]+)\s*=\s*__turbopack_context__\.r\([^)]+\)/g)];
for (const m of matches.slice(-10)) {
  console.log(m[0]);
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
