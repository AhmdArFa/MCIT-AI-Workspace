const fs = require('fs');

const files = [
  '/app/frontend/.next/static/chunks/0ia9f5xzckr26.js',
  '/app/frontend/.next/server/chunks/ssr/_1md1ks3._.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Missing:', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Pattern in client bundle: (0,t.jsx)("div",{className:"av",children:h})
  // Or in SSR: (0,s.jsx)("div",{className:"av",children:l}) or similar
  const pattern = /(\(0,\s*([a-zA-Z0-9_$]+)\.jsx\)\("div",\{className:"av",children:[a-zA-Z0-9_$]+\}\))/;
  
  const match = content.match(pattern);
  if (match) {
    const fullMatch = match[1];
    const jsxObj = match[2];
    const replacement = `(0,${jsxObj}.jsx)("div",{className:"av overflow-hidden flex items-center justify-center p-0",children:(0,${jsxObj}.jsx)("img",{src:"/avatars/users/admin.svg",alt:"Admin",className:"w-full h-full object-cover rounded-full",onError:e=>{e.currentTarget.style.display="none"}})})`;
    content = content.replace(fullMatch, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched admin avatar in ${file} successfully!`);
  } else {
    console.log(`Pattern not matched in ${file}`);
    // Check if already patched
    if (content.includes('/avatars/users/admin.svg')) {
      console.log(`Already patched in ${file}`);
    }
  }
}
