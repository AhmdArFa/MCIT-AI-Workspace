const fs = require('fs');

console.log('=== Patching TuT Agent Avatar Switcher & Clickability ===');

const profileChunkPath = '/app/public/_spa/assets/profile-Bac-vNLs.js';
if (fs.existsSync(profileChunkPath)) {
  let code = fs.readFileSync(profileChunkPath, 'utf8');

  // 1. Remove e.preventDefault() from header container click handler
  const oldHeaderClick = 'onClick:e=>{e.stopPropagation(),e.preventDefault()}';
  const newHeaderClick = 'onClick:e=>{e.stopPropagation()}';
  if (code.includes(oldHeaderClick)) {
    code = code.replace(oldHeaderClick, newHeaderClick);
    console.log('[OK] Removed e.preventDefault() from AgentHeader click handler');
  }

  // 2. Make canEdit always true in AgentHeader
  const oldCanEdit = 'canEdit:n,description:i.description';
  const newCanEdit = 'canEdit:!0,description:i.description';
  if (code.includes(oldCanEdit)) {
    code = code.replace(oldCanEdit, newCanEdit);
    console.log('[OK] Forced canEdit to true in AgentHeader');
  }

  // 3. Force avatar picker popup to open regardless of permission
  const oldOpen = 'open:r?void 0:!1,popupClassName:';
  const newOpen = 'open:void 0,popupClassName:';
  if (code.includes(oldOpen)) {
    code = code.replace(oldOpen, newOpen);
    console.log('[OK] Allowed avatar popup to open regardless of permission');
  }

  // 4. Remove if(!n)return; from onAvatarChange in AgentHeader
  const oldOnAvatarChange = 'onAvatarChange:e=>{if(!n)return;let P=MCIT_AVATAR_LIST.find(x=>x.src===e);if(P){l(r,{avatar:P.src,name:P.label,title:P.title,description:P.title});try{L.getState().updateAgentConfigById(r,{openingMessage:P.welcome,systemRole:P.systemRole});}catch(_){}}else{l(r,{avatar:e});}}';
  const newOnAvatarChange = 'onAvatarChange:e=>{let P=MCIT_AVATAR_LIST.find(x=>x.src===e);let targetId=r||L.getState().activeAgentId||"agt_xEk7XfRtovAl";if(P){l(targetId,{avatar:P.src,name:P.label,title:P.title,description:P.title});try{L.getState().updateAgentConfigById(targetId,{openingMessage:P.welcome,systemRole:P.systemRole});}catch(_){}try{let bMap=L.getState().builtinAgentIdMap||{};for(let bid of Object.values(bMap)){if(bid&&bid!==targetId){l(bid,{avatar:P.src,name:P.label,title:P.title,description:P.title});}}}catch(_){}}else{l(targetId,{avatar:e});}}';
  if (code.includes(oldOnAvatarChange)) {
    code = code.replace(oldOnAvatarChange, newOnAvatarChange);
    console.log('[OK] Patched onAvatarChange to update all avatars and config');
  }

  // 5. In AgentHeader, add 1-click quick-switch avatar bar below role
  const roleTarget = 'children:[m?null:(0,Hl.jsx)(k,{ellipsis:!0,style:{color:p?F.colorTextSecondary:F.colorTextTertiary},children:p||e(`settingAgent.role.unset`,{ns:`setting`})}),s&&!m?(0,Hl.jsx)(k,{style:{color:F.colorTextTertiary},children:`·`}):null,s?(0,Hl.jsx)(oe,{title:e(`settingAgent.slug.openWith`,{ns:`setting`,slug:s}),children:(0,Hl.jsxs)(k,{code:!0,style:{color:F.colorTextSecondary,flex:`none`},children:[(0,Hl.jsx)(`span`,{style:{color:F.colorTextTertiary},children:`@`}),s]})}):null]';
  const avatarQuickBar = ',(0,Hl.jsx)(x,{gap:6,horizontal:!0,style:{flexWrap:`wrap`,marginTop:10},children:MCIT_AVATAR_LIST.map(P=>(0,Hl.jsx)(`button`,{key:P.id,type:`button`,title:P.label,style:{background:i.avatar===P.src?`rgba(212,175,55,0.22)`:`rgba(255,255,255,0.05)`,border:i.avatar===P.src?`2px solid #D4AF37`:`1px solid rgba(255,255,255,0.15)`,borderRadius:8,cursor:`pointer`,padding:`3px 8px 3px 4px`,display:`flex`,alignItems:`center`,gap:5,transition:`all 0.15s ease`},onClick:ev=>{ev.stopPropagation();ev.preventDefault();let targetId=r||L.getState().activeAgentId||"agt_xEk7XfRtovAl";l(targetId,{avatar:P.src,name:P.label,title:P.title,description:P.title});try{L.getState().updateAgentConfigById(targetId,{openingMessage:P.welcome,systemRole:P.systemRole});}catch(_){}try{let bMap=L.getState().builtinAgentIdMap||{};for(let bid of Object.values(bMap)){if(bid&&bid!==targetId){l(bid,{avatar:P.src,name:P.label,title:P.title,description:P.title});}}}catch(_){}},children:[(0,Hl.jsx)(`img`,{src:P.src,alt:P.label,style:{width:22,height:22,borderRadius:4,objectFit:`cover`}}),(0,Hl.jsx)(`span`,{style:{fontSize:11,color:i.avatar===P.src?`#D4AF37`:`inherit`,fontWeight:i.avatar===P.src?`600`:`400`},children:P.label})]}))})';

  if (!code.includes('avatarQuickBar-injected') && code.includes(roleTarget)) {
    code = code.replace(roleTarget, roleTarget + '/*' + 'avatarQuickBar-injected' + '*/' + avatarQuickBar);
    console.log('[OK] Injected 1-click avatar switcher bar in AgentHeader');
  }

  fs.writeFileSync(profileChunkPath, code, 'utf8');
  console.log('[DONE] Patched profile-Bac-vNLs.js successfully');
} else {
  console.error('File not found:', profileChunkPath);
}
