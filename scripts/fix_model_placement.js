const fs = require('fs');

const files = [
  '/app/public/_spa/assets/ChatInput-BO6gAidK.js',
  '/app/dist/desktop/assets/ChatInput-BO6gAidK.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('placement:t??\topRight')) {
    c = c.replaceAll('placement:t??\topRight', 'placement:t??"topRight"');
    fs.writeFileSync(f, c, 'utf8');
    console.log('Fixed placement in', f);
  } else if (c.includes('placement:t??`topRight`')) {
    c = c.replaceAll('placement:t??`topRight`', 'placement:t??"topRight"');
    fs.writeFileSync(f, c, 'utf8');
    console.log('Normalized placement in', f);
  } else {
    console.log('No replacement needed in', f);
  }
}
