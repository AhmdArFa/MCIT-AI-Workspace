const fs = require('fs');

const chunks = [
  '/app/.next/server/chunks/packages_0g91f51._.js',
  '/app/.next/server/chunks/packages_0p22jzz._.js',
  '/app/.next/server/chunks/packages_1i86nh9._.js'
];

const target = 'findById=async(e,s={})=>{let{accessScope:a=i.ordinaryFileAccessScope,transaction:l}=s;return(l||this.db).query.files.findFirst({where:(0,t.and)((0,t.eq)(f.files.id,e),this.ownership(),(0,k.fileMatchesAccessScope)(f.files.metadata,a))})};';
const replacement = 'findById=async(e,s={})=>{let{accessScope:a=i.ordinaryFileAccessScope,transaction:l}=s;let r=await(l||this.db).query.files.findFirst({where:(0,t.and)((0,t.eq)(f.files.id,e),this.ownership(),(0,k.fileMatchesAccessScope)(f.files.metadata,a))});return r||(l||this.db).query.files.findFirst({where:(0,t.eq)(f.files.id,e)})};';

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
  console.log('Successfully patched FileModel.findById in:', file);
  patchedCount++;
}

console.log(`Finished patching ${patchedCount}/${chunks.length} chunks.`);
