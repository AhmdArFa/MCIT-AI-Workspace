const fs = require('fs');

// 1. Patch Ollama generateObject in _0dwqyps._.js
const chunkPath1 = '/app/.next/server/chunks/_0dwqyps._.js';
if (fs.existsSync(chunkPath1)) {
  let content = fs.readFileSync(chunkPath1, 'utf8');
  const target = 'class nE{';
  const idx = content.indexOf(target);
  if (idx !== -1) {
    if (content.includes('async generateObject(') && content.slice(idx, idx + 4000).includes('generateObject')) {
      console.log('generateObject already present in class nE!');
    } else {
      const modelsIdx = content.indexOf('async models()', idx);
      if (modelsIdx !== -1) {
        const generateObjectCode = `async generateObject(e,t){try{let{messages:a,model:i,schema:o}=e,r=await this.buildOllamaMessages(a),n=()=>{this.client.abort(),t?.signal?.removeEventListener("abort",n)};t?.signal?.addEventListener("abort",n);let s=await this.client.chat({format:o||"json",messages:r,model:i,stream:!1}),l=s?.message?.content||"{}";try{return JSON.parse(l)}catch{return{content:l}}}catch(e){console.error("Ollama generateObject error:",e);throw e}}`;
        content = content.slice(0, modelsIdx) + generateObjectCode + content.slice(modelsIdx);
        fs.writeFileSync(chunkPath1, content, 'utf8');
        console.log('Successfully patched generateObject into class nE in _0dwqyps._.js!');
      }
    }
  }
}

// 2. Patch listDailyRecommend fallback in _08gl7tk._.js
const chunkPath2 = '/app/.next/server/chunks/_08gl7tk._.js';
if (fs.existsSync(chunkPath2)) {
  let content = fs.readFileSync(chunkPath2, 'utf8');
  const errorTarget = 'throw console.error("[taskTemplate:listDailyRecommend]",e),new i.TRPCError({cause:e,code:"INTERNAL_SERVER_ERROR",message:"Failed to list recommended task templates"})';
  if (content.includes(errorTarget)) {
    content = content.replace(errorTarget, 'return{data:[],success:!0}');
    fs.writeFileSync(chunkPath2, content, 'utf8');
    console.log('Successfully patched listDailyRecommend in _08gl7tk._.js!');
  } else {
    console.log('listDailyRecommend target already patched or not found');
  }
}
