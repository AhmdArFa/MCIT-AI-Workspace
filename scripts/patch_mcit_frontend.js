const fs = require('fs');
const path = require('path');

console.log('=== Starting MCIT AI Frontend Patching ===');

// 1. Patch Studio Dialog in static chunk
const staticChunkPath = '/app/frontend/.next/static/chunks/0hhmym6v1sf1-.js';
if (fs.existsSync(staticChunkPath)) {
  let staticCode = fs.readFileSync(staticChunkPath, 'utf8');
  const oldStaticPresetTarget = '(0,s.jsx)("div",{className:"grid grid-cols-2 gap-2",role:"radiogroup","aria-label":"What to create",children:i.map(e=>{let t=L[e.id].icon,n=(e.id===l?d:e.modes[0])==="dark"?_:A;return(0,s.jsxs)("button",{type:"button",role:"radio","aria-checked":l===e.id,disabled:er||!e.ready,onClick:()=>c(e.id),className:(0,F.cn)("flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors disabled:opacity-50",l===e.id?"border-primary/60 bg-muted":"hover:bg-muted/50"),children:[(0,s.jsxs)("div",{className:"flex h-9 overflow-hidden rounded-md border border-border",children:[(0,s.jsx)("span",{className:"flex-[3]",style:{background:n[0]}}),(0,s.jsx)("span",{className:"flex-[2]",style:{background:n[1]}}),(0,s.jsx)("span",{className:"flex-1",style:{background:n[2]}})]}),(0,s.jsxs)("span",{className:"flex items-center gap-2 text-sm font-medium",children:[(0,s.jsx)(t,{className:"h-4 w-4 text-primary"})," ",e.name]}),(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:e.description}),!e.ready&&(0,s.jsxs)("span",{className:"text-[11px] text-muted-foreground",children:["Needs: ",(e.missing||[]).join(", ")||"document engines"]})]},e.id)})})';
  
  const newStaticPresetCode = '(0,s.jsx)("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3.5",role:"radiogroup","aria-label":"What to create",children:i.map(e=>{let t=L[e.id].icon,isSelected=l===e.id;return(0,s.jsxs)("button",{type:"button",role:"radio","aria-checked":isSelected,disabled:er||!e.ready,onClick:()=>c(e.id),className:(0,F.cn)("group relative flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all duration-200 aspect-square disabled:opacity-50 select-none cursor-pointer",isSelected?"border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50":"border-border/60 bg-muted/20 hover:border-border hover:bg-muted/50"),children:[(0,s.jsx)("div",{className:(0,F.cn)("flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",isSelected?"bg-[#D4AF37]/20 text-[#D4AF37]":"bg-muted text-muted-foreground group-hover:text-foreground"),children:(0,s.jsx)(t,{className:"h-6 w-6"})}),(0,s.jsxs)("div",{className:"flex flex-col gap-1 items-center",children:[(0,s.jsx)("span",{className:"text-sm font-semibold tracking-tight text-foreground",children:e.name}),(0,s.jsx)("span",{className:"text-[11px] text-muted-foreground line-clamp-1 max-w-[140px]",children:e.description})]}),(0,s.jsx)("div",{className:"flex items-center gap-1.5 flex-wrap justify-center",children:(e.outputs||[]).map(out=>(0,s.jsx)("span",{className:(0,F.cn)("px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border",isSelected?"bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]":"bg-background/80 border-border/50 text-muted-foreground"),children:out},out))}),isSelected&&(0,s.jsx)("div",{className:"absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-black",children:(0,s.jsx)("span",{style:{fontSize:"10px",fontWeight:"bold",lineHeight:1},children:"\\u2713"})})]},e.id)})})';

  if (staticCode.includes(oldStaticPresetTarget)) {
    staticCode = staticCode.replace(oldStaticPresetTarget, newStaticPresetCode);
    fs.writeFileSync(staticChunkPath, staticCode, 'utf8');
    console.log('[OK] Patched StudioDialog in static chunk: ' + staticChunkPath);
  } else if (staticCode.includes('grid grid-cols-2 sm:grid-cols-4 gap-3.5')) {
    console.log('[SKIP] Static chunk already has squared Studio cards');
  } else {
    console.warn('[WARN] Old preset target not found in ' + staticChunkPath);
  }
}

// 2. Patch Studio Dialog in SSR chunks (server & standalone)
const ssrPaths = [
  '/app/frontend/.next/server/chunks/ssr/src_app_(dashboard)_notebooks_[id]_page_tsx_08glb8y._.js',
  '/app/frontend/.next/standalone/.next/server/chunks/ssr/src_app_(dashboard)_notebooks_[id]_page_tsx_08glb8y._.js'
];

const oldSsrPresetTarget = '(0,b.jsx)("div",{className:"grid grid-cols-2 gap-2",role:"radiogroup","aria-label":"What to create",children:h.map(a=>{let c=I[a.id].icon,d=(a.id===i?k:a.modes[0])==="dark"?G:H;return(0,b.jsxs)("button",{type:"button",role:"radio","aria-checked":i===a.id,disabled:af||!a.ready,onClick:()=>j(a.id),className:(0,F.cn)("flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors disabled:opacity-50",i===a.id?"border-primary/60 bg-muted":"hover:bg-muted/50"),children:[(0,b.jsxs)("div",{className:"flex h-9 overflow-hidden rounded-md border border-border",children:[(0,b.jsx)("span",{className:"flex-[3]",style:{background:d[0]}}),(0,b.jsx)("span",{className:"flex-[2]",style:{background:d[1]}}),(0,b.jsx)("span",{className:"flex-1",style:{background:d[2]}})]}),(0,b.jsxs)("span",{className:"flex items-center gap-2 text-sm font-medium",children:[(0,b.jsx)(c,{className:"h-4 w-4 text-primary"})," ",a.name]}),(0,b.jsx)("span",{className:"text-xs text-muted-foreground",children:a.description}),!a.ready&&(0,b.jsxs)("span",{className:"text-[11px] text-muted-foreground",children:["Needs: ",(a.missing||[]).join(", ")||"document engines"]})]},a.id)})})';

const newSsrPresetCode = '(0,b.jsx)("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3.5",role:"radiogroup","aria-label":"What to create",children:h.map(a=>{let c=I[a.id].icon,isSelected=i===a.id;return(0,b.jsxs)("button",{type:"button",role:"radio","aria-checked":isSelected,disabled:af||!a.ready,onClick:()=>j(a.id),className:(0,F.cn)("group relative flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all duration-200 aspect-square disabled:opacity-50 select-none cursor-pointer",isSelected?"border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/50":"border-border/60 bg-muted/20 hover:border-border hover:bg-muted/50"),children:[(0,b.jsx)("div",{className:(0,F.cn)("flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",isSelected?"bg-[#D4AF37]/20 text-[#D4AF37]":"bg-muted text-muted-foreground group-hover:text-foreground"),children:(0,b.jsx)(c,{className:"h-6 w-6"})}),(0,b.jsxs)("div",{className:"flex flex-col gap-1 items-center",children:[(0,b.jsx)("span",{className:"text-sm font-semibold tracking-tight text-foreground",children:a.name}),(0,b.jsx)("span",{className:"text-[11px] text-muted-foreground line-clamp-1 max-w-[140px]",children:a.description})]}),(0,b.jsx)("div",{className:"flex items-center gap-1.5 flex-wrap justify-center",children:(a.outputs||[]).map(out=>(0,b.jsx)("span",{className:(0,F.cn)("px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border",isSelected?"bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]":"bg-background/80 border-border/50 text-muted-foreground"),children:out},out))}),isSelected&&(0,b.jsx)("div",{className:"absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-black",children:(0,b.jsx)("span",{style:{fontSize:"10px",fontWeight:"bold",lineHeight:1},children:"\\u2713"})})]},a.id)})})';

for (const p of ssrPaths) {
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    if (code.includes(oldSsrPresetTarget)) {
      code = code.replace(oldSsrPresetTarget, newSsrPresetCode);
      fs.writeFileSync(p, code, 'utf8');
      console.log('[OK] Patched StudioDialog in SSR chunk: ' + p);
    } else if (code.includes('grid grid-cols-2 sm:grid-cols-4 gap-3.5')) {
      console.log('[SKIP] SSR chunk already has squared Studio cards: ' + p);
    } else {
      console.warn('[WARN] Old SSR preset target not found in ' + p);
    }
  }
}

// 3. Remove Podcasts from sidebar navigation
// Static chunk
const staticSidebarPath = '/app/frontend/.next/static/chunks/0hohitdlwm20_.js';
if (fs.existsSync(staticSidebarPath)) {
  let code = fs.readFileSync(staticSidebarPath, 'utf8');
  const podcastNavTarget = ',(0,t.jsxs)(r.default,{href:"/podcasts",className:`nav ${f("/podcasts")?"on":""}`,children:[(0,t.jsxs)("svg",{className:"i",viewBox:"0 0 24 24",children:[(0,t.jsx)("path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"}),(0,t.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"})]}),(0,t.jsx)("span",{children:"Podcasts"})]})';
  if (code.includes(podcastNavTarget)) {
    code = code.replace(podcastNavTarget, '');
    fs.writeFileSync(staticSidebarPath, code, 'utf8');
    console.log('[OK] Removed Podcasts from static sidebar chunk');
  } else {
    console.log('[SKIP or not found] Podcasts static sidebar target in ' + staticSidebarPath);
  }
}

// SSR chunks
const ssrSidebarPaths = [
  '/app/frontend/.next/server/chunks/ssr/_1md1ks3._.js',
  '/app/frontend/.next/standalone/.next/server/chunks/ssr/_1md1ks3._.js'
];
for (const p of ssrSidebarPaths) {
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    const podcastSsrTarget = ',(0,b.jsxs)(c.default,{href:"/podcasts",className:`nav ${n("/podcasts")?"on":""}`,children:[(0,b.jsxs)("svg",{className:"i",viewBox:"0 0 24 24",children:[(0,b.jsx)("path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"}),(0,b.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"})]}),(0,b.jsx)("span",{children:"Podcasts"})]})';
    if (code.includes(podcastSsrTarget)) {
      code = code.replace(podcastSsrTarget, '');
      fs.writeFileSync(p, code, 'utf8');
      console.log('[OK] Removed Podcasts from SSR sidebar chunk: ' + p);
    } else {
      console.log('[SKIP or not found] Podcasts SSR sidebar target in ' + p);
    }
  }
}

// 4. Add redirect from /podcasts to /notebooks
const routesManifestPaths = [
  '/app/frontend/.next/routes-manifest.json',
  '/app/frontend/.next/standalone/.next/routes-manifest.json'
];

for (const p of routesManifestPaths) {
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (data.redirects && !data.redirects.some(r => r.source === '/podcasts')) {
        data.redirects.push({
          source: '/podcasts',
          destination: '/notebooks',
          statusCode: 307,
          regex: '^(?!/_next)/podcasts(?:/)?$'
        });
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
        console.log('[OK] Added /podcasts -> /notebooks redirect in ' + p);
      } else {
        console.log('[SKIP] Redirect already present in ' + p);
      }
    } catch (e) {
      console.error('[ERR] Failed updating ' + p + ':', e);
    }
  }
}

// 5. Update server.js _originalRedirects
const serverJsPath = '/app/frontend/server.js';
if (fs.existsSync(serverJsPath)) {
  let serverCode = fs.readFileSync(serverJsPath, 'utf8');
  if (!serverCode.includes('"source":"/podcasts"')) {
    serverCode = serverCode.replace(
      '"_originalRedirects":[{"source":"/settings/api-keys","destination":"/settings/models","permanent":true}]',
      '"_originalRedirects":[{"source":"/settings/api-keys","destination":"/settings/models","permanent":true},{"source":"/podcasts","destination":"/notebooks","permanent":false}]'
    );
    fs.writeFileSync(serverJsPath, serverCode, 'utf8');
    console.log('[OK] Added /podcasts redirect in server.js');
  }
}

console.log('=== Frontend Patching Completed Successfully! ===');
