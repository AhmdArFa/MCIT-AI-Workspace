const fs = require('fs');

console.log('--- Patching providers and ChatInput in tut-agent ---');

// 1. Patch server chunk 1: packages_model-bank_src_modelProviders_index_ts_0o6jzbw._.js
const chunk1Path = '/app/.next/server/chunks/packages_model-bank_src_modelProviders_index_ts_0o6jzbw._.js';
if (fs.existsSync(chunk1Path)) {
  let content = fs.readFileSync(chunk1Path, 'utf8');
  console.log('Read chunk1, size:', content.length);

  // Disable external providers in chunk1
  const externalProviders = ['anthropic', 'bfl', 'cometapi', 'deepseek', 'google', 'newapi', 'openai'];
  for (const prov of externalProviders) {
    // Pattern: enabled:!0,...id:"prov" OR id:"prov",...enabled:!0
    // In minified code: id:"anthropic" or enabled:!0
    // Let's replace enabled:!0 in its specific provider definition
    const provIdx = content.indexOf(`id:"${prov}"`);
    if (provIdx !== -1) {
      // Find the object start/end around provIdx
      const start = Math.max(0, provIdx - 200);
      const end = Math.min(content.length, provIdx + 300);
      const sub = content.slice(start, end);
      const replaced = sub.replace('enabled:!0', 'enabled:!1');
      if (replaced !== sub) {
        content = content.slice(0, start) + replaced + content.slice(end);
        console.log(`Disabled ${prov} in chunk1`);
      } else {
        console.log(`Could not find enabled:!0 near id:"${prov}" in chunk1`);
      }
    }
  }

  // Enable ollama in chunk1
  const ollamaIdx = content.indexOf('id:"ollama"');
  if (ollamaIdx !== -1) {
    const start = Math.max(0, ollamaIdx - 200);
    const end = Math.min(content.length, ollamaIdx + 300);
    const sub = content.slice(start, end);
    if (!sub.includes('enabled:!0')) {
      const replaced = sub.replace('id:"ollama"', 'enabled:!0,id:"ollama"');
      content = content.slice(0, start) + replaced + content.slice(end);
      console.log('Added enabled:!0 to ollama in chunk1');
    } else {
      console.log('ollama already has enabled:!0');
    }
  }

  fs.writeFileSync(chunk1Path, content, 'utf8');
  console.log('Saved chunk1');
} else {
  console.log('chunk1 not found:', chunk1Path);
}

// 2. Patch server chunk 2: packages_model-bank_src_modelProviders_1_u37y-._.js
const chunk2Path = '/app/.next/server/chunks/packages_model-bank_src_modelProviders_1_u37y-._.js';
if (fs.existsSync(chunk2Path)) {
  let content = fs.readFileSync(chunk2Path, 'utf8');
  console.log('Read chunk2, size:', content.length);

  const mcitIdx = content.indexOf('id:"mcit"');
  if (mcitIdx !== -1) {
    const start = Math.max(0, mcitIdx - 200);
    const end = Math.min(content.length, mcitIdx + 300);
    const sub = content.slice(start, end);
    const replaced = sub.replace('enabled:!0', 'enabled:!1');
    if (replaced !== sub) {
      content = content.slice(0, start) + replaced + content.slice(end);
      console.log('Disabled mcit in chunk2');
      fs.writeFileSync(chunk2Path, content, 'utf8');
    }
  }
} else {
  console.log('chunk2 not found:', chunk2Path);
}

// 3. Patch client bundle: ChatInput-BO6gAidK.js
const chatInputPath = '/app/dist/desktop/assets/ChatInput-BO6gAidK.js';
if (fs.existsSync(chatInputPath)) {
  let content = fs.readFileSync(chatInputPath, 'utf8');
  console.log('Read ChatInput, size:', content.length);

  const gfIdx = content.indexOf('Gf=e=>{');
  if (gfIdx !== -1) {
    const endGf = content.indexOf('qf,Jf=', gfIdx);
    if (endGf !== -1) {
      const oldGf = content.slice(gfIdx, endGf);
      console.log('Old Gf length:', oldGf.length);
      
      // Unlocked Gf
      const newGf = `Gf=e=>{let{allowed:t}=or(\`create_content\`),{canConfigureResource:n,canUseResource:r,isAccessLoading:i}=Hf(),inboxId=V(e=>e.builtinAgentIdMap?.inbox||e.defaultAgentId),targetId=e||inboxId,a=V(oi.getAgentById(targetId)),o=V(oi.getAgencyConfigById(targetId)),s=V(oi.getAgentModelById(targetId)),c=V(oi.getAgentModelProviderById(targetId)),l=V(e=>e.updateAgentConfigById),{canManageAgent:u,isAccessLoading:d}=Qo(targetId),f=Mn(a??{}),p=!!a?.workspaceId&&a.visibility!==\`private\`&&(f||!u),m=kn(e=>e.updateWorkspaceUserPreference),h=kn(e=>e.workspaceUserPreference),{data:g,isLoading:_}=kn(e=>e.useFetchWorkspaceUserPreference)(),v=g===void 0?h:g??{},y=v.agentModelOverrides?.[targetId]||v.agentModelOverrides?.[e],b={agencyConfig:o,model:s,personalModelSelection:f,provider:c,visibility:a?.visibility,workspaceId:a?.workspaceId,canManage:u},x=jr(b,y),S=tn(b),C=fl(),w=!1,isPersonal=!0,T=!0,E=!0,D=void 0,O=(0,Wf.useCallback)(async t=>{let dest=targetId||e;try{await m({agentModelOverrides:{...v.agentModelOverrides,[dest]:t}})}catch(_){}try{if(dest)await l(dest,C(t))}catch(_){}},[targetId,e,C,v.agentModelOverrides,l,m]);return{canDisplayModel:!0,canSelectModel:!0,isPreferenceLoading:!1,model:x.model,provider:x.provider??c,selectionLockReason:void 0,selectionPolicy:S,selectModel:O,usesWorkspaceMemberSelection:p}}})),`;
      
      content = content.slice(0, gfIdx) + newGf + content.slice(endGf);

      // Enforce a=!0 in Qg (ModelSwitch)
      const oldQgStart = '{canDisplayModel:r,canSelectModel:a,model:o,provider:s,selectionLockReason:c,selectModel:l}=Gf(n)';
      const newQgStart = '{canDisplayModel:r,canSelectModel:_rawA,model:o,provider:s,selectionLockReason:c,selectModel:l}=Gf(n),a=!0';
      if (content.includes(oldQgStart)) {
        content = content.replace(oldQgStart, newQgStart);
      }
      const oldQgReturn = ':a?(0,Zg.jsx)(Cl,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):(0,Zg.jsx)(R,{title:_??g,children:C}):null';
      const newQgReturn = ':(0,Zg.jsx)(Cl,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):null';
      if (content.includes(oldQgReturn)) {
        content = content.replace(oldQgReturn, newQgReturn);
      }

      fs.writeFileSync(chatInputPath, content, 'utf8');
      console.log('Successfully patched Gf and Qg in ChatInput-BO6gAidK.js');
    } else {
      console.log('Could not find end of Gf');
    }
  } else {
    console.log('Could not find Gf=e=>{ in ChatInput');
  }
} else {
  console.log('ChatInput not found:', chatInputPath);
}

// 4. Patch mobile bundle: ChatInput-BJuQT8Pn.js
const mobileChatInputPath = '/app/dist/mobile/assets/ChatInput-BJuQT8Pn.js';
if (fs.existsSync(mobileChatInputPath)) {
  let content = fs.readFileSync(mobileChatInputPath, 'utf8');
  console.log('Read mobile ChatInput, size:', content.length);

  const oldBmPattern = 'w=d||p&&_,T=t&&(p?r&&S===`member`:n)&&!i&&!w,E=!!e&&t&&r&&!i&&!w,D=E&&!T?p&&S===`fixed`?`fixedByAgent`:`useOnly`:void 0,O=(0,zm.useCallback)(async t=>{if(T){if(p){if(S!==`member`||_)return;await m({agentModelOverrides:{...v.agentModelOverrides,[e]:t}});return}await l(e,C(t))}},[e,C,T,_,v.agentModelOverrides,S,l,m,p]);return{canDisplayModel:E,canSelectModel:T,isPreferenceLoading:w,model:x.model,provider:x.provider??c,selectionLockReason:D,selectionPolicy:S,selectModel:O,usesWorkspaceMemberSelection:p}}})),';
  const newBm = 'w=!1,T=!0,E=!0,D=void 0,O=(0,zm.useCallback)(async t=>{try{await m({agentModelOverrides:{...v.agentModelOverrides,[e]:t}})}catch(_){}try{if(e)await l(e,C(t))}catch(_){}},[e,C,v.agentModelOverrides,l,m]);return{canDisplayModel:!0,canSelectModel:!0,isPreferenceLoading:!1,model:x.model,provider:x.provider??c,selectionLockReason:void 0,selectionPolicy:S,selectModel:O,usesWorkspaceMemberSelection:p}}})),';

  if (content.includes(oldBmPattern)) {
    content = content.replace(oldBmPattern, newBm);
  }

  const oldFcStart = '{canDisplayModel:r,canSelectModel:i,model:a,provider:s,selectionLockReason:c,selectModel:l}=Bm(n)';
  const newFcStart = '{canDisplayModel:r,canSelectModel:_rawI,model:a,provider:s,selectionLockReason:c,selectModel:l}=Bm(n),i=!0';
  if (content.includes(oldFcStart)) {
    content = content.replace(oldFcStart, newFcStart);
  }

  const oldFcReturn = ':i?(0,PC.jsx)(eC,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):(0,PC.jsx)(I,{title:_??g,children:C}):null';
  const newFcReturn = ':(0,PC.jsx)(eC,{enabledList:void 0,model:m,notice:void 0,openOnHover:!1,placement:t??`topRight`,provider:h,onModelChange:b,children:C}):null';
  if (content.includes(oldFcReturn)) {
    content = content.replace(oldFcReturn, newFcReturn);
  }

  fs.writeFileSync(mobileChatInputPath, content, 'utf8');
  console.log('Successfully patched mobile ChatInput');
}

console.log('Done patching.');
