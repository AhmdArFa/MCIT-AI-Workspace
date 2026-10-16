const fs = require('fs');
const path = require('path');

console.log('=== Patching TuT AI Brand in Frontend Chunks ===');

function patchFile(filepath, fn) {
  if (!fs.existsSync(filepath)) {
    console.log('[SKIP] File not found:', filepath);
    return;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  const updated = fn(content);
  if (updated !== content) {
    fs.writeFileSync(filepath, updated, 'utf8');
    console.log('[OK] Patched:', filepath);
  } else {
    console.log('[NO-CHANGE] Nothing changed in:', filepath);
  }
}

// 1. AppSidebar brand icon
const sidebarFiles = [
  '/app/frontend/.next/static/chunks/0ia9f5xzckr26.js',
  '/app/frontend/.next/server/chunks/ssr/_1md1ks3._.js'
];

for (const f of sidebarFiles) {
  patchFile(f, (code) => {
    // Regex for old svg brand in sidebar
    return code.replace(
      /\(\d+,[a-zA-Z0-9_$]+\.jsx\)\("svg",\{className:"i",viewBox:"0 0 24 24",style:\{width:28,height:28,color:"var\(--gold\)"\},children:\(\d+,[a-zA-Z0-9_$]+\.jsx\)\("path",\{d:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"\}\)\}\)/g,
      (match) => {
        // extract jsx identifier, e.g. (0,b.jsx) or (0,s.jsx)
        const jsxMatch = match.match(/\((\d+,[a-zA-Z0-9_$]+\.jsx)\)/);
        const jsx = jsxMatch ? `(${jsxMatch[1]})` : '(0,b.jsx)';
        return `${jsx}("img",{src:"/tut-brand.svg",alt:"TuT AI",style:{width:28,height:28,objectFit:"contain"}})`;
      }
    );
  });
}

// 2. LoginForm brand avatar
const loginFiles = [
  '/app/frontend/.next/static/chunks/3vj2ymiwd93cl.js',
  '/app/frontend/.next/static/chunks/3wn6szfnutl3w.js',
  '/app/frontend/.next/server/chunks/ssr/_08ln3un._.js',
  '/app/frontend/.next/server/chunks/ssr/_0rmex_3._.js'
];

for (const f of loginFiles) {
  patchFile(f, (code) => {
    // Replace size 88
    let res = code.replace(
      /\(\d+,[a-zA-Z0-9_$]+\.jsx\)\([a-zA-Z0-9_$]+\.TutAvatar,\{size:88\}\)/g,
      (match) => {
        const jsxMatch = match.match(/\((\d+,[a-zA-Z0-9_$]+\.jsx)\)/);
        const jsx = jsxMatch ? `(${jsxMatch[1]})` : '(0,b.jsx)';
        return `${jsx}("img",{src:"/tut-brand.png",alt:"TuT AI",width:88,height:88,className:"shrink-0 rounded-2xl object-cover ring-1 ring-border/50 shadow-md bg-black"})`;
      }
    );
    // Replace size 56 in login (mobile)
    res = res.replace(
      /\(\d+,[a-zA-Z0-9_$]+\.jsx\)\([a-zA-Z0-9_$]+\.TutAvatar,\{size:56\}\)/g,
      (match) => {
        const jsxMatch = match.match(/\((\d+,[a-zA-Z0-9_$]+\.jsx)\)/);
        const jsx = jsxMatch ? `(${jsxMatch[1]})` : '(0,b.jsx)';
        return `${jsx}("img",{src:"/tut-brand.png",alt:"TuT AI",width:56,height:56,className:"shrink-0 rounded-2xl object-cover ring-1 ring-border/50 shadow-md bg-black"})`;
      }
    );
    return res;
  });
}

// 3. About page brand avatar
const aboutFiles = [
  '/app/frontend/.next/static/chunks/08h8-n1qrjnlr.js',
  '/app/frontend/.next/server/chunks/ssr/src_app_(dashboard)_about_page_tsx_0bm5kkg._.js'
];

for (const f of aboutFiles) {
  patchFile(f, (code) => {
    return code.replace(
      /\(\d+,[a-zA-Z0-9_$]+\.jsx\)\([a-zA-Z0-9_$]+\.TutAvatar,\{size:56\}\)/g,
      (match) => {
        const jsxMatch = match.match(/\((\d+,[a-zA-Z0-9_$]+\.jsx)\)/);
        const jsx = jsxMatch ? `(${jsxMatch[1]})` : '(0,b.jsx)';
        return `${jsx}("img",{src:"/tut-brand.png",alt:"TuT AI",width:56,height:56,className:"shrink-0 rounded-2xl object-cover ring-1 ring-border/50 shadow-md bg-black"})`;
      }
    );
  });
}

console.log('=== Frontend Chunks Brand Patch Complete ===');
