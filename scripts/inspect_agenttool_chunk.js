const fs = require('fs');

const f = '/app/dist/desktop/assets/AgentTool-TDriUQoN.js';
if (fs.existsSync(f)) {
  const c = fs.readFileSync(f, 'utf8');
  let idx = 0;
  while ((idx = c.indexOf('skillStore.tabs.mcit', idx)) !== -1) {
    console.log(c.slice(Math.max(0, idx - 100), Math.min(c.length, idx + 200)));
    idx += 20;
  }
}
