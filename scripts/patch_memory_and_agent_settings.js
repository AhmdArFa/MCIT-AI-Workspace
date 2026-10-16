const fs = require('fs');

console.log('=== Patching Memory and Agent Settings in tut-agent ===');

// 1. Patch memory-D1rUlmdl.js
const memoryPath = '/app/dist/desktop/assets/memory-D1rUlmdl.js';
if (fs.existsSync(memoryPath)) {
  let c = fs.readFileSync(memoryPath, 'utf8');
  const idx = c.indexOf('manage_settings');
  if (idx !== -1) {
    const start = c.lastIndexOf('{allowed:t', idx);
    const end = c.indexOf(')', idx);
    if (start !== -1 && end !== -1) {
      const oldSnippet = c.slice(start, end + 1);
      console.log('Old memory snippet:', oldSnippet);
      const newSnippet = '{allowed:t_p,reason:r}=C(`manage_settings`);let t=!0';
      c = c.slice(0, start) + newSnippet + c.slice(end + 1);
      fs.writeFileSync(memoryPath, c, 'utf8');
      console.log('[OK] Patched memory-D1rUlmdl.js');
    }
  }
}

// 2. Patch AgentSettings-B-mZgSxv.js
const agentSettingsPath = '/app/dist/desktop/assets/AgentSettings-B-mZgSxv.js';
if (fs.existsSync(agentSettingsPath)) {
  let c = fs.readFileSync(agentSettingsPath, 'utf8');
  const idx = c.indexOf('edit_own_content');
  if (idx !== -1) {
    const start = c.lastIndexOf('{allowed:t}', idx);
    const end = c.indexOf(')', idx);
    if (start !== -1 && end !== -1) {
      const oldSnippet = c.slice(start, end + 1);
      console.log('Old agentSettings snippet:', oldSnippet);
      const newSnippet = '{allowed:t_p}=T(`edit_own_content`);let t=!0';
      c = c.slice(0, start) + newSnippet + c.slice(end + 1);
      fs.writeFileSync(agentSettingsPath, c, 'utf8');
      console.log('[OK] Patched AgentSettings-B-mZgSxv.js');
    }
  }
}

console.log('=== Patching Complete ===');
