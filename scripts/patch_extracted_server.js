const fs = require('fs');

const serverFile = './temp_next/standalone/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

const hook = `// --- MCIT Cache & Chunk Interceptor ---
const http = require('http');
const originalEmit = http.Server.prototype.emit;
http.Server.prototype.emit = function (event, req, res) {
  if (event === 'request' && req && res) {
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
      if (typeof name === 'string' && name.toLowerCase() === 'cache-control') {
        return originalSetHeader.call(this, name, 'no-cache, no-store, must-revalidate');
      }
      return originalSetHeader.call(this, name, value);
    };
  }
  return originalEmit.apply(this, arguments);
};
// ----------------------------------------
`;

if (!content.includes('MCIT Cache & Chunk Interceptor')) {
  content = hook + content;
  fs.writeFileSync(serverFile, content);
  console.log('Successfully injected cache interceptor into standalone server.js');
}
