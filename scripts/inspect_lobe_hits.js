const fs = require('fs');
const path = require('path');

const files = [
  'C:\\MCIT AI Final\\agent\\src\\features\\Settings\\creds\\features\\CreateCredModal\\CredTypeSelector.tsx',
  'C:\\MCIT AI Final\\agent\\src\\features\\Settings\\creds\\features\\CredItem.tsx',
  'C:\\MCIT AI Final\\agent\\src\\features\\Settings\\oauth-apps\\features\\CreateAppModal\\Content.tsx',
  'C:\\MCIT AI Final\\agent\\src\\features\\ToolSetting\\const.tsx',
  'C:\\MCIT AI Final\\agent\\src\\features\\ModelSwitchPanel\\hooks\\useModelDetailPanel.ts',
  'C:\\MCIT AI Final\\agent\\src\\features\\CommunityWorkspaceSettings\\index.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    console.log('=== ' + path.basename(f) + ' ===');
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (/lobe/i.test(l)) {
        console.log(`  L${i+1}: ${l.trim()}`);
      }
    });
  }
}
