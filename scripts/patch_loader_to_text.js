const fs = require('fs');

const files = [
  '/app/public/_spa/assets/index-8qv-oyAx.js',
  '/app/dist/desktop/assets/index-8qv-oyAx.js'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('PJt,{size:44,type:`combine`}')) {
      c = c.replaceAll('PJt,{size:44,type:`combine`}', 'PJt,{size:44,type:`text`}');
      fs.writeFileSync(f, c, 'utf8');
      console.log('[OK] Patched loader to text-only in', f);
    } else {
      console.log('[INFO] Pattern not found or already patched in', f);
    }
  }
}
