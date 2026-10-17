const fs = require('fs');
const cp = require('child_process');

const files = [
  'ChatInput-BO6gAidK.js',
  '_layout-M7AKyzf6.js',
  'chat-Ch8iWO9I.js'
];

for (const f of files) {
  const full = '/app/public/_spa/assets/' + f;
  const tmp = '/tmp/check_' + f.replace('.js', '.mjs');
  fs.copyFileSync(full, tmp);
  try {
    cp.execFileSync('node', ['--check', tmp]);
    console.log('VALID:', f);
  } catch (err) {
    console.error('ERROR in ' + f + ':', err.stderr ? err.stderr.toString() : err.message);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
}
