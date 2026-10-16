import subprocess

cmd = """
const fs = require('fs');
const c = fs.readFileSync('/app/.next/server/chunks/_08gl7tk._.js', 'utf8');
const idx = c.indexOf('fileModel:new g.FileModel');
const sub = c.substring(Math.max(0, idx - 5000), idx);
// look for g=
let pos = sub.lastIndexOf('g=');
while (pos !== -1) {
    console.log('Match:', sub.substring(pos, pos + 80));
    pos = sub.lastIndexOf('g=', pos - 1);
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
