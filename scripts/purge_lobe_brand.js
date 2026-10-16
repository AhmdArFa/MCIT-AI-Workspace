const fs = require('fs');

const replacements = [
  {
    path: '/app/dist/desktop/assets/AgentIcon-D2n4r1ab.js',
    from: '`LobeHub`',
    to: '`MCIT AI`'
  },
  {
    path: '/app/dist/desktop/assets/EmojiPicker-D0FCAVmj.js',
    from: 'fullTitle:`LobeHub`',
    to: 'fullTitle:`MCIT AI`'
  },
  {
    path: '/app/dist/desktop/assets/Highlighter-Bxxf6Z_E.js',
    from: 'displayName:`Lobe Theme`',
    to: 'displayName:`MCIT Theme`'
  },
  {
    path: '/app/dist/desktop/assets/Markdown-CSdsteau.js',
    from: 'displayName:`Lobe Theme`',
    to: 'displayName:`MCIT Theme`'
  }
];

for (const r of replacements) {
  if (fs.existsSync(r.path)) {
    let c = fs.readFileSync(r.path, 'utf8');
    if (c.includes(r.from)) {
      c = c.replaceAll(r.from, r.to);
      fs.writeFileSync(r.path, c, 'utf8');
      console.log('[OK] Purged Lobe brand in', r.path);
    }
  }
}
console.log('Purge complete.');
