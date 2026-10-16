import subprocess

cmd = """
const fs = require('fs');
for (const p of ['/app/.next/server/chunks/packages_0g91f51._.js', '/app/.next/server/chunks/packages_0p22jzz._.js', '/app/.next/server/chunks/packages_1i86nh9._.js']) {
  const c = fs.readFileSync(p, 'utf8');
  const idx = c.indexOf('findById=async');
  console.log('=== ' + p + ' ===');
  console.log(c.substring(idx, idx + 400));
}
"""

res = subprocess.run(["docker", "exec", "-e", "NODE_PATH=/app/node_modules", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
