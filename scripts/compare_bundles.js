const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('/tmp/ChatInput-BO6gAidK.mjs', 'utf8');

// Let's use Acorn or a simple binary search on the code
// First let's check if the desktop version has this error!
const desktopCode = fs.readFileSync('/app/dist/desktop/assets/ChatInput-BO6gAidK.js', 'utf8');
try {
  new vm.SourceTextModule(desktopCode);
  console.log('Desktop ChatInput is VALID!');
} catch (e) {
  console.log('Desktop ChatInput error:', e.message);
}

// Compare desktop vs spa!
console.log('SPA length:', code.length, 'Desktop length:', desktopCode.length);
if (code.length === desktopCode.length && code === desktopCode) {
  console.log('SPA and Desktop are IDENTICAL');
} else {
  console.log('They differ!');
  // Find differences
  for (let i = 0; i < Math.min(code.length, desktopCode.length); i++) {
    if (code[i] !== desktopCode[i]) {
      console.log('First diff at index', i);
      console.log('SPA:', JSON.stringify(code.substring(i - 20, i + 50)));
      console.log('Desktop:', JSON.stringify(desktopCode.substring(i - 20, i + 50)));
      break;
    }
  }
}
