const fs = require('fs');

const files = [
  '/app/dist/desktop/assets/profile-Bac-vNLs.js',
  '/app/public/_spa/assets/profile-Bac-vNLs.js'
];

for (const p of files) {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes("championed Ma'at")) {
      c = c.replace("championed Ma'at", "championed Ma\\'at");
      fs.writeFileSync(p, c, 'utf8');
      console.log('Fixed single quote in', p);
    } else {
      console.log('championed Ma\'at not found in', p);
    }
  }
}
