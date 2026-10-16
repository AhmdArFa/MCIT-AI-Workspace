// Script to patch persona convergence and avatar settings in mcit-ai-tut-agent-1
const fs = require('fs');

const profileChunkPath = '/app/dist/desktop/assets/profile-Bac-vNLs.js';
const layoutChunkPath = '/app/dist/desktop/assets/_layout-M7AKyzf6.js';

console.log('=== Patching profile-Bac-vNLs.js ===');
if (fs.existsSync(profileChunkPath)) {
  let profile = fs.readFileSync(profileChunkPath, 'utf8');

  // 1. Disable model avatars (remove generic 3D/Lobe cartoon avatar tab)
  if (profile.includes('allowModelAvatar:!0')) {
    profile = profile.replace('allowModelAvatar:!0', 'allowModelAvatar:!1');
    console.log('Replaced allowModelAvatar:!0 with allowModelAvatar:!1');
  } else {
    console.log('allowModelAvatar:!0 not found (maybe already patched)');
  }

  // 2. Patch onAvatarChange in AgentHeader
  // Search for onAvatarChange:e=>{n&&l(r,{avatar:e})}
  const targetHeader = 'onAvatarChange:e=>{n&&l(r,{avatar:e})}';
  const replacementHeader = 'onAvatarChange:e=>{if(!n)return;let P=bt.find(x=>x.src===e);if(P){l(r,{avatar:P.src,name:P.label,title:P.title,description:P.title});try{L.getState().updateAgentConfigById(r,{openingMessage:P.welcome,systemRole:P.systemRole});}catch(_){}}else{l(r,{avatar:e});}}';
  if (profile.includes(targetHeader)) {
    profile = profile.replace(targetHeader, replacementHeader);
    console.log('Patched onAvatarChange in AgentHeader');
  } else {
    console.log('targetHeader not found');
  }

  // 3. Patch onClick in MCIT gallery button: onClick:()=>d(t.src)
  const targetClick = 'onClick:()=>d(t.src)';
  const replacementClick = 'onClick:()=>{let P=bt.find(x=>x.src===t.src);if(P){l(r,{avatar:P.src,name:P.label,title:P.title,description:P.title});try{L.getState().updateAgentConfigById(r,{openingMessage:P.welcome,systemRole:P.systemRole});}catch(_){}}d(t.src);}';
  if (profile.includes(targetClick)) {
    profile = profile.replace(targetClick, replacementClick);
    console.log('Patched onClick in MCIT gallery button');
  } else {
    console.log('targetClick not found');
  }

  fs.writeFileSync(profileChunkPath, profile, 'utf8');
  console.log('Updated', profileChunkPath);
}

console.log('=== Patching _layout-M7AKyzf6.js ===');
if (fs.existsSync(layoutChunkPath)) {
  let layout = fs.readFileSync(layoutChunkPath, 'utf8');

  // 1. In gC (PortraitBubble): prioritize wMsg over r?.plain
  const targetBubble = 'children:r?.plain?(0,mC.jsx)(oC,{parsed:r}):wMsg';
  const replacementBubble = 'children:wMsg||(r?.plain?(0,mC.jsx)(oC,{parsed:r}):"")';
  if (layout.includes(targetBubble)) {
    layout = layout.replace(targetBubble, replacementBubble);
    console.log('Patched gC PortraitBubble to prioritize wMsg');
  } else {
    console.log('targetBubble not found');
  }

  // 2. Dynamic persona name in header/session fallback instead of hardcoded 'Tut Agent'
  const targetSession = 'm?`Tut Agent`:e(`defaultSession`,{ns:`common`})';
  const replacementSession = 'm?(h?.name||h?.title||(h?.avatar?.includes("thoth")?"Thoth":h?.avatar?.includes("cleopatra")?"Cleopatra":h?.avatar?.includes("nefertiti")?"Nefertiti":h?.avatar?.includes("nefertari")?"Nefertari":h?.avatar?.includes("hatshepsut")?"Hatshepsut":h?.avatar?.includes("ramesses")?"Ramesses":h?.avatar?.includes("akhenaten")?"Akhenaten":h?.avatar?.includes("khufu")?"Khufu":"Tut Agent")):e(`defaultSession`,{ns:`common`})';
  if (layout.includes(targetSession)) {
    layout = layout.replace(targetSession, replacementSession);
    console.log('Patched header session title fallback for personas');
  } else {
    console.log('targetSession not found');
  }

  fs.writeFileSync(layoutChunkPath, layout, 'utf8');
  console.log('Updated', layoutChunkPath);
}
