const fs = require('fs');

console.log('--- Patching TuT Agent generateObject fallback ---');

const chunkPath = '/app/.next/server/chunks/_0dwqyps._.js';

if (!fs.existsSync(chunkPath)) {
  console.error('Target chunk not found:', chunkPath);
  process.exit(1);
}

let code = fs.readFileSync(chunkPath, 'utf8');

const target = 's=await this._runtime.generateObject(e,n)';
const fallbackMarker = 'TuT-generateObject-fallback';

if (code.includes(fallbackMarker)) {
  console.log('Chunk is already patched with TuT-generateObject-fallback.');
} else {
  if (!code.includes(target)) {
    console.error('Target string not found in chunk!');
    process.exit(1);
  }
  
  const replacement = 's=await (typeof this._runtime?.generateObject==="function"?this._runtime.generateObject(e,n):(async()=>{try{let _u=process.env.OLLAMA_PROXY_URL||"http://host.docker.internal:11434",_m=(e.messages||[]).map(e=>({role:e.role||"user",content:typeof e.content=="string"?e.content:JSON.stringify(e.content)})),_r=await fetch(`${_u}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:e.model||process.env.OLLAMA_CHAT_MODEL||"gemma4:e4b",messages:_m,format:e.schema&&typeof e.schema=="object"?e.schema:"json",stream:!1})}),_d=await _r.json(),_t=_d?.message?.content||"{}";try{return JSON.parse(_t)}catch{return{content:_t}}}catch(_e){console.error("[TuT-generateObject-fallback] error:",_e);return{content:""}}})())';
  
  code = code.replace(target, replacement);
  fs.writeFileSync(chunkPath, code, 'utf8');
  console.log('Successfully patched generateObject fallback in _0dwqyps._.js!');
}

console.log('--- Done patching TuT Agent generateObject ---');
