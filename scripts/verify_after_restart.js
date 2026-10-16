const fs = require('fs');

console.log('--- Verifying Tut Agent patches after restart ---');

// 1. Check profile-Bac-vNLs.js
const p1 = '/app/dist/desktop/assets/profile-Bac-vNLs.js';
if (fs.existsSync(p1)) {
  const c1 = fs.readFileSync(p1, 'utf8');
  console.log('profile-Bac-vNLs has MCIT_AVATAR_LIST:', c1.includes('MCIT_AVATAR_LIST'));
  console.log('profile-Bac-vNLs has allowModelAvatar:!1:', c1.includes('allowModelAvatar:!1'));
}

// 2. Check memory-D1rUlmdl.js
const p2 = '/app/dist/desktop/assets/memory-D1rUlmdl.js';
if (fs.existsSync(p2)) {
  const c2 = fs.readFileSync(p2, 'utf8');
  console.log('memory-D1rUlmdl has let t=!0:', c2.includes('let t=!0'));
}

// 3. Check AgentSettings-B-mZgSxv.js
const p3 = '/app/dist/desktop/assets/AgentSettings-B-mZgSxv.js';
if (fs.existsSync(p3)) {
  const c3 = fs.readFileSync(p3, 'utf8');
  console.log('AgentSettings-B-mZgSxv has let t=!0:', c3.includes('let t=!0'));
}

// 4. Check ChatInput-BO6gAidK.js
const p4 = '/app/dist/desktop/assets/ChatInput-BO6gAidK.js';
if (fs.existsSync(p4)) {
  const c4 = fs.readFileSync(p4, 'utf8');
  console.log('ChatInput has isPersonal:', c4.includes('isPersonal'));
}
