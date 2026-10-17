const fs = require('fs');

const files = [
  '/app/public/_spa/assets/_layout-M7AKyzf6.js',
  '/app/dist/desktop/assets/_layout-M7AKyzf6.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  // Replace oc (UserAvatar) size:28
  if (c.includes('shape:`square`,size:28')) {
    c = c.replaceAll('shape:`square`,size:28', 'shape:`square`,size:36');
    changed = true;
  }
  // Also if ProductLogo size:28 in header
  if (c.includes('size:28,type:`text`')) {
    c = c.replaceAll('size:28,type:`text`', 'size:32,type:`text`');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('Scaled user avatar and logo in', f);
  } else {
    console.log('Pattern not found in', f);
  }
}
