const fs = require('fs');

console.log('=== Master Patch: Unlocking Model Selection in All Bundles ===');

// 1. Desktop & Mobile in /app/dist
const distDesktop = '/app/dist/desktop/assets/ChatInput-BO6gAidK.js';
const distMobile = '/app/dist/mobile/assets/ChatInput-BJuQT8Pn.js';
const publicDesktop = '/app/public/_spa/assets/ChatInput-BO6gAidK.js';
const publicMobile = '/app/public/_spa/assets/ChatInput-BJuQT8Pn.js';
const publicShare = '/app/public/_spa-share/assets/ChatInput-D3X8s1BV.js';

function patchDesktopFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let c = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching desktop file ${filePath}, size: ${c.length}`);

  // Patch Gf
  const gfIdx = c.indexOf('Gf=e=>{');
  if (gfIdx !== -1) {
    const endGf = c.indexOf('qf,Jf=', gfIdx);
    if (endGf !== -1) {
      const newGf = `Gf=e=>{let{allowed:t}=or(\`create_content\`),{canConfigureResource:n,canUseResource:r,isAccessLoading:i}=Hf(),inboxId=V(e=>e.builtinAgentIdMap?.inbox||e.defaultAgentId),targetId=e||inboxId,a=V(oi.getAgentById(targetId)),o=V(oi.getAgencyConfigById(targetId)),s=V(oi.getAgentModelById(targetId)),c=V(oi.getAgentModelProviderById(targetId)),l=V(e=>e.updateAgentConfigById),{canManageAgent:u,isAccessLoading:d}=Qo(targetId),f=Mn(a??{}),p=!!a?.workspaceId&&a.visibility!==\`private\`&&(f||!u),m=kn(e=>e.updateWorkspaceUserPreference),h=kn(e=>e.workspaceUserPreference),{data:g,isLoading:_}=kn(e=>e.useFetchWorkspaceUserPreference)(),v=g===void 0?h:g??{},y=v.agentModelOverrides?.[targetId]||v.agentModelOverrides?.[e],b={agencyConfig:o,model:s,personalModelSelection:f,provider:c,visibility:a?.visibility,workspaceId:a?.workspaceId,canManage:u},x=jr(b,y),S=tn(b),C=fl(),w=!1,isPersonal=!0,T=!0,E=!0,D=void 0,O=(0,Wf.useCallback)(async t=>{let dest=targetId||e;try{await m({agentModelOverrides:{...v.agentModelOverrides,[dest]:t}})}catch(_){}try{if(dest)await l(dest,C(t))}catch(_){}},[targetId,e,C,v.agentModelOverrides,l,m]);return{canDisplayModel:!0,canSelectModel:!0,isPreferenceLoading:!1,model:x.model,provider:x.provider??c,selectionLockReason:void 0,selectionPolicy:S,selectModel:O,usesWorkspaceMemberSelection:p}}})),`;
      c = c.slice(0, gfIdx) + newGf + c.slice(endGf);
      console.log(`  Patched Gf in ${filePath}`);
    }
  }

  // Enforce a=!0 in Qg
  const oldQgStart = '{canDisplayModel:r,canSelectModel:a,model:o,provider:s,selectionLockReason:c,selectModel:l}=Gf(n)';
  const newQgStart = '{canDisplayModel:r,canSelectModel:_rawA,model:o,provider:s,selectionLockReason:c,selectModel:l}=Gf(n),a=!0';
  if (c.includes(oldQgStart)) {
    c = c.replace(oldQgStart, newQgStart);
    console.log(`  Enforced a=!0 in Qg in ${filePath}`);
  }

  // Remove tooltip lock fallback from Qg return
  const oldQgReturn = ':a?(0,Zg.jsx)(Cl,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):(0,Zg.jsx)(R,{title:_??g,children:C}):null';
  const newQgReturn = ':(0,Zg.jsx)(Cl,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):null';
  if (c.includes(oldQgReturn)) {
    c = c.replace(oldQgReturn, newQgReturn);
    console.log(`  Removed lock fallback from Qg in ${filePath}`);
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log(`Saved ${filePath}, new size: ${c.length}`);
}

function patchMobileFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let c = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching mobile file ${filePath}, size: ${c.length}`);

  // Patch Bm
  const bmIdx = c.indexOf('Bm=e=>{');
  if (bmIdx !== -1) {
    const endBm = c.indexOf('Hm,Um=', bmIdx);
    if (endBm !== -1) {
      const newBm = `Bm=e=>{let{allowed:t}=Ar(\`create_content\`),{canConfigureResource:n,canUseResource:r,isAccessLoading:i}=Lm(),a=z(Cr.getAgentById(e)),o=z(Cr.getAgencyConfigById(e)),s=z(Cr.getAgentModelById(e)),c=z(Cr.getAgentModelProviderById(e)),l=z(e=>e.updateAgentConfigById),{canManageAgent:u,isAccessLoading:d}=$c(e),f=ca(a??{}),p=!!a?.workspaceId&&a.visibility!==\`private\`&&(f||!u),m=Wn(e=>e.updateWorkspaceUserPreference),h=Wn(e=>e.workspaceUserPreference),{data:g,isLoading:_}=Wn(e=>e.useFetchWorkspaceUserPreference)(),v=g===void 0?h:g??{},y=v.agentModelOverrides?.[e],b={agencyConfig:o,model:s,personalModelSelection:f,provider:c,visibility:a?.visibility,workspaceId:a?.workspaceId,canManage:u},x=ii(b,y),S=wr(b),C=jm(),w=!1,isPersonal=!0,T=!0,E=!0,D=void 0,O=(0,zm.useCallback)(async t=>{try{await m({agentModelOverrides:{...v.agentModelOverrides,[e]:t}})}catch(_){}try{if(e)await l(e,C(t))}catch(_){}},[e,C,v.agentModelOverrides,l,m]);return{canDisplayModel:!0,canSelectModel:!0,isPreferenceLoading:!1,model:x.model,provider:x.provider??c,selectionLockReason:void 0,selectionPolicy:S,selectModel:O,usesWorkspaceMemberSelection:p}}})),`;
      c = c.slice(0, bmIdx) + newBm + c.slice(endBm);
      console.log(`  Patched Bm in ${filePath}`);
    }
  }

  // Enforce i=!0 in FC
  const oldFcStart = '{canDisplayModel:r,canSelectModel:i,model:a,provider:s,selectionLockReason:c,selectModel:l}=Bm(n)';
  const newFcStart = '{canDisplayModel:r,canSelectModel:_rawI,model:a,provider:s,selectionLockReason:c,selectModel:l}=Bm(n),i=!0';
  if (c.includes(oldFcStart)) {
    c = c.replace(oldFcStart, newFcStart);
    console.log(`  Enforced i=!0 in FC in ${filePath}`);
  }

  // Remove tooltip lock fallback from FC return
  const oldFcReturn = ':i?(0,PC.jsx)(eC,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):(0,PC.jsx)(I,{title:_??g,children:C}):null';
  const newFcReturn = ':(0,PC.jsx)(eC,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):null';
  if (c.includes(oldFcReturn)) {
    c = c.replace(oldFcReturn, newFcReturn);
    console.log(`  Removed lock fallback from FC in ${filePath}`);
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log(`Saved ${filePath}, new size: ${c.length}`);
}

function patchShareFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let c = fs.readFileSync(filePath, 'utf8');
  console.log(`Patching share file ${filePath}, size: ${c.length}`);

  // Patch rb hook in share
  const oldHookPattern = 'w=d||p&&_,ee=t&&(p?r&&S===`member`:n)&&!i&&!w,T=!!e&&t&&r&&!i&&!w,te=T&&!ee?p&&S===`fixed`?`fixedByAgent`:`useOnly`:void 0,E=(0,nb.useCallback)(async t=>{if(ee){if(p){if(S!==`member`||_)return;await m({agentModelOverrides:{...v.agentModelOverrides,[e]:t}});return}await l(e,C(t))}},[e,C,ee,_,v.agentModelOverrides,S,l,m,p]);return{canDisplayModel:T,canSelectModel:ee,isPreferenceLoading:w,model:x.model,provider:x.provider??c,selectionLockReason:te,selectionPolicy:S,selectModel:E,usesWorkspaceMemberSelection:p}}})),';

  const newHook = 'w=!1,ee=!0,T=!0,te=void 0,E=(0,nb.useCallback)(async t=>{try{await m({agentModelOverrides:{...v.agentModelOverrides,[e]:t}})}catch(_){}try{if(e)await l(e,C(t))}catch(_){}},[e,C,v.agentModelOverrides,l,m]);return{canDisplayModel:!0,canSelectModel:!0,isPreferenceLoading:!1,model:x.model,provider:x.provider??c,selectionLockReason:void 0,selectionPolicy:S,selectModel:E,usesWorkspaceMemberSelection:p}}})),';

  if (c.includes(oldHookPattern)) {
    c = c.replace(oldHookPattern, newHook);
    console.log(`  Patched hook in ${filePath}`);
  }

  const oldShareStart = '{canDisplayModel:r,canSelectModel:i,model:a,provider:o,selectionLockReason:s,selectModel:c}=rb(n)';
  const newShareStart = '{canDisplayModel:r,canSelectModel:_rawI,model:a,provider:o,selectionLockReason:s,selectModel:c}=rb(n),i=!0';
  if (c.includes(oldShareStart)) {
    c = c.replace(oldShareStart, newShareStart);
    console.log(`  Enforced i=!0 in share ModelSwitch in ${filePath}`);
  }

  const oldShareReturn = ':i?(0,YO.jsx)(pO,{enabledList:void 0,model:p,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:m,onModelChange:y,children:S}):(0,YO.jsx)(lO,{title:d??h,children:S}):null';
  const newShareReturn = ':(0,YO.jsx)(pO,{enabledList:void 0,model:p,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:m,onModelChange:y,children:S}):null';
  if (c.includes(oldShareReturn)) {
    c = c.replace(oldShareReturn, newShareReturn);
    console.log(`  Removed lock fallback from share ModelSwitch in ${filePath}`);
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log(`Saved ${filePath}, new size: ${c.length}`);
}

// Apply to all
patchDesktopFile(distDesktop);
patchDesktopFile(publicDesktop);
patchMobileFile(distMobile);
patchMobileFile(publicMobile);
patchShareFile(publicShare);

console.log('=== Done patching all files ===');
