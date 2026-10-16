import subprocess

cmd = """
const fs = require('fs');
const c = fs.readFileSync('/app/.next/server/chunks/_08gl7tk._.js', 'utf8');
const idx = c.indexOf('getFileItemById');
// find definition of W
const wDef = c.lastIndexOf('const W=', idx);
if (wDef !== -1) {
    console.log('wDef:', c.substring(wDef, wDef + 400));
} else {
    // maybe W=async
    const wAsync = c.lastIndexOf('W=async', idx);
    console.log('wAsync:', c.substring(wAsync, wAsync + 400));
}
"""

res = subprocess.run(["docker", "exec", "mcit-ai-tut-agent-1", "node", "-e", cmd], capture_output=True, text=True)
print("STDOUT:\n", res.stdout)
