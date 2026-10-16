const fs = require('fs');

console.log('=== Verifying Desktop ChatInput ===');
const desktop = fs.readFileSync('/app/dist/desktop/assets/ChatInput-BO6gAidK.js', 'utf8');
const gfIdx = desktop.indexOf('canSelectModel:!0,isPreferenceLoading:!1');
console.log('Desktop Gf patched:', gfIdx !== -1);
const qgIdx = desktop.indexOf('canSelectModel:_rawA');
console.log('Desktop Qg a=!0 enforced:', qgIdx !== -1);
const qgLockIdx = desktop.indexOf('(0,Zg.jsx)(R,{title:_??g,children:C})');
console.log('Desktop Qg tooltip lock removed:', qgLockIdx === -1);

console.log('=== Verifying Mobile ChatInput ===');
const mobile = fs.readFileSync('/app/dist/mobile/assets/ChatInput-BJuQT8Pn.js', 'utf8');
const bmIdx = mobile.indexOf('canSelectModel:!0,isPreferenceLoading:!1');
console.log('Mobile Bm patched:', bmIdx !== -1);
const fcIdx = mobile.indexOf('canSelectModel:_rawI');
console.log('Mobile FC i=!0 enforced:', fcIdx !== -1);
const fcLockIdx = mobile.indexOf('(0,PC.jsx)(I,{title:_??g,children:C})');
console.log('Mobile FC tooltip lock removed:', fcLockIdx === -1);
