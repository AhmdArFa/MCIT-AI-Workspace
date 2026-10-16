import subprocess

cmd = """
const fs = require('fs');
const p = '/app/frontend/.next/routes-manifest.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

const exists = data.rewrites.afterFiles.some(r => r.source === '/f/:path*');
if (!exists) {
  data.rewrites.afterFiles.push({
    source: '/f/:path*',
    destination: 'http://localhost:5055/f/:path*',
    regex: '^/f(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$'
  });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated routes-manifest.json');
} else {
  console.log('Already in routes-manifest.json');
}
"""

res = subprocess.run(["docker", "exec", "mcit-ai-mcit-ai-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
print("STDERR:\n", res.stderr)
