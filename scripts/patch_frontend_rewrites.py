import subprocess

cmd = """
const fs = require('fs');
const p = '/app/frontend/server.js';
let c = fs.readFileSync(p, 'utf8');

const target = '"afterFiles":[{"source":"/api/:path*","destination":"http://localhost:5055/api/:path*"}]';
const replacement = '"afterFiles":[{"source":"/api/:path*","destination":"http://localhost:5055/api/:path*"},{"source":"/f/:path*","destination":"http://localhost:5055/f/:path*"}]';

if (c.includes(replacement)) {
  console.log('Already patched');
} else if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully patched server.js rewrites');
} else {
  console.error('Target not found in server.js');
}
"""

res = subprocess.run(["docker", "exec", "mcit-ai-mcit-ai-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
