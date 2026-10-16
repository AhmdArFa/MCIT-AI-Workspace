const fs = require('fs');

console.log('=== Patching Tut Agent to Merge Inside MCIT AI ===');

const indexPath = '/app/dist/desktop/index.html';
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // 1. Enforce true jet black background #000000 in CSS
  html = html.replace(/#0b0d12/g, '#000000');
  html = html.replace(/background:\s*#ffffff;/g, 'background: #000000;');

  // 2. Prevent opening in individual tab: if window.top === window.self, redirect to parent MCIT AI (/tut)
  const redirectScript = `
    <script>
      (function() {
        try {
          if (window.top === window.self) {
            // User opened http://localhost:3210 directly in an individual tab.
            // Redirect to MCIT AI so Tut Agent is merged inside the main application.
            var host = window.location.hostname || 'localhost';
            window.location.replace('http://' + host + ':8502/tut');
          }
        } catch (_) {}
      })();
    </script>
  `;

  if (!html.includes('window.location.replace')) {
    html = html.replace('<head>', '<head>' + redirectScript);
    console.log('[OK] Added tab merge redirect script to index.html');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[OK] Patched', indexPath);
}

const authIndexPath = '/app/dist/desktop/index.auth.html';
if (fs.existsSync(authIndexPath)) {
  let html = fs.readFileSync(authIndexPath, 'utf8');
  html = html.replace(/#0b0d12/g, '#000000');
  html = html.replace(/background:\s*#ffffff;/g, 'background: #000000;');
  fs.writeFileSync(authIndexPath, html, 'utf8');
  console.log('[OK] Patched', authIndexPath);
}

console.log('=== Tut Agent Merge Patch Complete ===');
