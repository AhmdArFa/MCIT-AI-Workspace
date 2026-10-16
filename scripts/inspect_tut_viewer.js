const fs = require('fs');

const files = [
  '/app/dist/desktop/assets/FileViewer-MoBrt2fb.js',
  '/app/public/_spa/assets/FileViewer-MoBrt2fb.js',
];

files.forEach((p) => {
  try {
    let c = fs.readFileSync(p, 'utf8');
    const idx = c.indexOf('.displayName=`MSDocViewer`');
    if (idx === -1) {
      console.log('MSDocViewer not found in', p);
      return;
    }
    console.log('Found MSDocViewer at', idx);
    // Find the definition of Kt=(0,Ht.memo)(({fileName:e,fileType:t,url:n})=>
    const sub = c.substring(idx - 450, idx);
    console.log('Snippet before displayName:', sub);
  } catch (err) {
    console.error('Error:', err.message);
  }
});
