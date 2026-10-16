const fs = require('fs');
const path = require('path');

console.log('=== Starting comprehensive Tut Agent Patch ===');

const layoutTargets = [
  '/app/public/_spa/assets/_layout-M7AKyzf6.js',
  '/app/dist/desktop/assets/_layout-M7AKyzf6.js',
];

for (const layoutBundle of layoutTargets) {
  if (fs.existsSync(layoutBundle)) {
    let content = fs.readFileSync(layoutBundle, 'utf8');
    let layoutModified = false;

    // Search target for mx and hx
    const oldMxHx = `mx=cr(({css:e})=>({image:e\`
    pointer-events: none;

    position: absolute;
    inset-block-end: var(--home-portrait-overlap);
    inset-inline-end: \${12}px;

    width: var(--home-portrait-width);
    height: var(--home-portrait-height);

    object-fit: contain;
    object-position: bottom;
  \`,root:e\`
    position: relative;
    height: 100%;
  \`})),hx=(0,fx.memo)(()=>{let{agentId:e}=Tb();I(e=>e.useFetchAgentConfig)(!0,e??\`\`);let t=I(hr.getAgentMetaById(e??\`\`)),n=I(hr.getAgentFullBodyArtworkById(e??\`\`)),r=Ou(t.avatar||en),i=n||r.hero;return(0,px.jsx)(\`div\`,{className:mx.root,children:(0,px.jsx)(\`img\`,{"aria-hidden":!0,alt:\`\`,className:mx.image,src:i},i)})})`;

    const newMxHx = `mx=cr(({css:e})=>({image:e\`
    display: block;
    width: 120px;
    height: 120px;
    border-radius: 22px;
    overflow: hidden;
    border: 2px solid rgba(201,162,39,0.45);
    background: var(--ant-color-bg-container);
    box-shadow: 0 10px 28px rgba(0,0,0,0.25), 0 0 16px rgba(201,162,39,0.18);
    object-fit: cover;
    object-position: center 10%;
    margin-inline-start: auto;
    margin-block-end: 4px;
    user-select: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    pointer-events: auto;
    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 14px 34px rgba(0,0,0,0.32), 0 0 22px rgba(201,162,39,0.3);
    }
    @media (max-width: 576px) {
      width: 88px;
      height: 88px;
      border-radius: 18px;
    }
  \`,root:e\`
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  \`})),hx=(0,fx.memo)(()=>{let{agentId:e}=Tb();I(e=>e.useFetchAgentConfig)(!0,e??\`\`);let t=I(hr.getAgentMetaById(e??\`\`)),n=I(hr.getAgentFullBodyArtworkById(e??\`\`));let aKey=((t&&(t.avatar||t.name))||\`\`).toLowerCase();let pSrc=(t&&t.avatar&&(t.avatar.startsWith('/')||t.avatar.startsWith('http')))?t.avatar:(aKey.includes('thoth')?'/avatars/mcit/thoth-avatar.webp':aKey.includes('cleopatra')?'/avatars/mcit/cleopatra.webp':aKey.includes('nefertiti')?'/avatars/mcit/nefertiti.webp':aKey.includes('nefertari')?'/avatars/mcit/nefertari.webp':aKey.includes('hatshepsut')?'/avatars/mcit/hatshepsut.webp':aKey.includes('ramesses')?'/avatars/mcit/ramesses.webp':aKey.includes('akhenaten')?'/avatars/mcit/akhenaten.webp':aKey.includes('khufu')?'/avatars/mcit/khufu.webp':'/avatars/mcit/tutankhamun.webp');let i=n||pSrc;return(0,px.jsx)(\`div\`,{className:mx.root,children:(0,px.jsx)(\`img\`,{"aria-hidden":!0,alt:t?.title||t?.name||\`Agent\`,className:mx.image,src:i,onError:ev=>{if(!ev.target.src.endsWith('tutankhamun.webp')){ev.target.src='/avatars/mcit/tutankhamun.webp';}}},i)})})`;

    if (content.includes(oldMxHx)) {
      content = content.replace(oldMxHx, newMxHx);
      layoutModified = true;
      console.log(`[OK] Patched mx and hx (HomePortrait) in ${layoutBundle}`);
    } else if (content.includes('pSrc=')) {
      console.log(`[ALREADY] mx and hx already patched in ${layoutBundle}`);
    } else {
      console.log(`[WARN] oldMxHx signature not found in ${layoutBundle}`);
    }

    // Search target for gC (PortraitBubble)
    const oldGc = `gC=(0,pC.memo)(({promo:e})=>{let{t}=s(\`home\`),{currentPair:n}=_x(),r=n?.welcome?dC(n.welcome):void 0;return(0,mC.jsx)(\`div\`,{className:hC.bubble,children:e??(0,mC.jsx)(\`div\`,{className:hC.line,children:r?.plain?(0,mC.jsx)(oC,{parsed:r}):t(\`dashboard.greeting.subtitle\`)})})})`;

    const newGc = `gC=(0,pC.memo)(({promo:e})=>{let{t}=s(\`home\`),{currentPair:n}=_x(),r=n?.welcome?dC(n.welcome):void 0;let{agentId:agId}=Tb();let aMeta=I(hr.getAgentMetaById(agId??\`\`));let aKey=((aMeta&&(aMeta.avatar||aMeta.name))||\`\`).toLowerCase();let wMsg=(aMeta&&aMeta.description&&aMeta.description.trim())||(aKey.includes('thoth')?'I am Thoth, keeper of sacred wisdom and scribe of truth. What knowledge or analysis shall we craft?':aKey.includes('cleopatra')?'Welcome to my royal court. What strategic vision, diplomatic treatise, or decisive plan shall we command?':aKey.includes('nefertiti')?'Peace and radiant light upon you. What visionary ideas or creative horizons shall we illuminate today?':aKey.includes('nefertari')?'Welcome, honored scholar. How may I bring clarity, harmony, and elegance to your endeavors today?':aKey.includes('hatshepsut')?'I am Hatshepsut, builder of timeless monuments. What monumental project or execution plan shall we erect?':aKey.includes('ramesses')?'I am Ramesses the Great. Command your highest ambitions, and we shall conquer any obstacle together.':aKey.includes('akhenaten')?'Living in truth under the rising sun. What deep philosophies, original theories, or breakthroughs call to us?':aKey.includes('khufu')?'I am Khufu, architect of the Great Pyramid of Giza. What enduring foundations and precision frameworks shall we design?':'Greetings, noble traveler. How may Tut guide your knowledge journey across the kingdom today?');return(0,mC.jsx)(\`div\`,{className:hC.bubble,children:e??(0,mC.jsx)(\`div\`,{className:hC.line,children:r?.plain?(0,mC.jsx)(oC,{parsed:r}):wMsg})})})`;

    if (content.includes(oldGc)) {
      content = content.replace(oldGc, newGc);
      layoutModified = true;
      console.log(`[OK] Patched gC (PortraitBubble) in ${layoutBundle}`);
    } else if (content.includes('wMsg=')) {
      console.log(`[ALREADY] gC already patched in ${layoutBundle}`);
    } else {
      console.log(`[WARN] oldGc signature not found in ${layoutBundle}`);
    }

    // Update line clamp in hC to 3 lines
    if (content.includes('-webkit-line-clamp: 2;')) {
      content = content.replace('-webkit-line-clamp: 2;', '-webkit-line-clamp: 3;');
      content = content.replace('-webkit-line-clamp:2;', '-webkit-line-clamp:3;');
      layoutModified = true;
      console.log(`[OK] Updated -webkit-line-clamp to 3 in ${layoutBundle}`);
    }

    if (layoutModified) {
      fs.writeFileSync(layoutBundle, content, 'utf8');
      console.log(`[SAVED] ${layoutBundle} updated`);
    }
  } else {
    console.log(`[NOT FOUND] ${layoutBundle}`);
  }
}

// 2. Patch Background Colors across files
function patchThemeInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Dark background #000 -> #0b0d12
    if (content.includes("html[data-theme='dark'] body {\n        background-color: #000;\n      }")) {
      content = content.replace(
        "html[data-theme='dark'] body {\n        background-color: #000;\n      }",
        "html[data-theme='dark'] body {\n        background-color: #0b0d12;\n      }"
      );
      modified = true;
    }
    if (content.includes("html[data-theme=\\'dark\\'] body {\\n        background-color: #000;\\n      }")) {
      content = content.replace(
        "html[data-theme=\\'dark\\'] body {\\n        background-color: #000;\\n      }",
        "html[data-theme=\\'dark\\'] body {\\n        background-color: #0b0d12;\\n      }"
      );
      modified = true;
    }
    if (content.includes("background-color: #000;")) {
      content = content.replace(/html\[data-theme=['"]dark['"]\] body \{\s*background-color:\s*#000;\s*\}/g, "html[data-theme='dark'] body { background-color: #0b0d12; }");
      modified = true;
    }

    // Light background #f8f8f8 -> #ffffff
    if (content.includes("background: #f8f8f8;")) {
      content = content.replace(/background:\s*#f8f8f8;/g, "background: #ffffff;");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[THEME UPDATED] ${filePath}`);
    }
  } catch (err) {
    console.error(`[ERROR] ${filePath}:`, err.message);
  }
}

const directThemeFiles = [
  '/app/dist/desktop/index.html',
  '/app/dist/mobile/index.mobile.html',
  '/app/public/not-compatible.html',
  '/app/.next/server/chunks/src_app_spa_[variants]_[[___path]]_spaHtmlTemplates_ts_1_hish0._.js',
  '/app/.next/server/chunks/src_app_spa-auth_authHtmlTemplate_ts_1k_qey9._.js',
  '/app/.next/server/chunks/src_app_spa-workbench_workbenchHtmlTemplate_ts_050okgf._.js',
];

for (const f of directThemeFiles) {
  patchThemeInFile(f);
}

// Recursively patch route cache
function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full);
    } else if (entry.isFile() && (entry.name.endsWith('.body') || entry.name.endsWith('.html') || entry.name.endsWith('.js'))) {
      patchThemeInFile(full);
    }
  }
}

walkDir('/app/.next/server/route-cache');

console.log('=== Patch script complete ===');
