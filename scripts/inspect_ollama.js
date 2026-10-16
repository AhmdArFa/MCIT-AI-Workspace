const fs = require('fs');

const f = '/app/.next/server/chunks/packages_model-bank_src_modelProviders_index_ts_0o6jzbw._.js';
const c = fs.readFileSync(f, 'utf8');
const idx = c.indexOf('id:"ollama"');
console.log('Ollama full definition in chunk:');
console.log(c.slice(idx - 100, idx + 400));
