import subprocess

cmd = """
const fs = require('fs');
const c = fs.readFileSync('/app/.next/server/chunks/_08gl7tk._.js', 'utf8');
// Find where g is defined or imported
const idx = c.indexOf('fileModel:new g.FileModel');
console.log(c.substring(idx - 200, idx + 100));

// Find what g is
// Look for var g = or g = ...
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
