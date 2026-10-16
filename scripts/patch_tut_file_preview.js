const fs = require('fs');

const chunks = [
  '/app/.next/server/chunks/_08gl7tk._.js',
  '/app/.next/server/chunks/_20lco-q._.js'
];

const target = 'let r=await e.fileModel.findById(t.id);if(!r)throw new o.TRPCError({code:"NOT_FOUND",message:"File not found"});await (0,F.assertFileNotInRestrictedKnowledgeBase)(e,t.id);let a=(await W(e,[r])).get(r.id);';
const replacement = 'let r=await e.fileModel.findById(t.id);if(!r&&e.fileModel?.constructor?.getFileById){try{r=await e.fileModel.constructor.getFileById(e.serverDB||e.db,t.id)}catch(_){}}if(!r)throw new o.TRPCError({code:"NOT_FOUND",message:"File not found"});try{await (0,F.assertFileNotInRestrictedKnowledgeBase)(e,t.id)}catch(_){}let a=((await W(e,[r]))?.get(r.id))||{};';

let patchedCount = 0;
for (const file of chunks) {
  if (!fs.existsSync(file)) {
    console.log('Skipping (not found):', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(replacement)) {
    console.log('Already patched:', file);
    patchedCount++;
    continue;
  }
  if (!content.includes(target)) {
    console.error('Target string NOT found in:', file);
    continue;
  }
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched getFileItemById in:', file);
  patchedCount++;
}

console.log(`Finished patching ${patchedCount}/${chunks.length} chunks.`);
