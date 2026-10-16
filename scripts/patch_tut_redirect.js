const fs = require('fs');

const files = [
  '/app/dist/desktop/index.html',
  '/app/dist/mobile/index.mobile.html',
  '/app/.next/server/route-cache/APP_ROUTE/12c3e303f0ce79afb13c88b9de3d2a7b482409e7d1a46dace5b55c031f146cbe/$/spa-auth/en-US/signin.body'
];

const guard = `<script>
(function() {
  try {
    if (window.top === window.self) {
      var host = window.location.hostname || 'localhost';
      window.location.replace('http://' + host + ':8502/tut');
    }
  } catch(e) {}
})();
</script>`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('window.top === window.self')) {
      content = content.replace('<head>', '<head>\n' + guard);
      fs.writeFileSync(file, content);
      console.log('Injected guard into', file);
    } else {
      console.log('Already guarded:', file);
    }
  } else {
    console.log('File does not exist:', file);
  }
}
