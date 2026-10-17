const fs = require('fs');

const code = fs.readFileSync('/tmp/ChatInput-BO6gAidK.mjs', 'utf8');
const lines = code.split('\n');
console.log('Total lines:', lines.length);

// Let's check around where we modified:
// Look for placement: or topRight or Cl
const idx = code.indexOf('openOnHover:!1');
console.log('Around openOnHover:', code.substring(idx - 100, idx + 200));

// Let's use vm to compile script
const vm = require('vm');
try {
  new vm.SourceTextModule(code);
} catch (err) {
  console.log('Module error:', err);
  console.log('Stack:', err.stack);
}
