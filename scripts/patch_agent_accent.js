
const fs = require('fs');

const htmlFiles = [
  '/app/dist/desktop/index.html',
  '/app/dist/mobile/index.mobile.html',
  '/app/public/_spa/index.html'
];

const accentSyncScript = `
<script id="tut-accent-sync">
(function() {
  function applyAccent(color) {
    if (!color) return;
    try {
      localStorage.setItem('mcit-accent-color', color);
    } catch(e) {}
    var el = document.getElementById('tut-injected-accent-style');
    if (!el) {
      el = document.createElement('style');
      el.id = 'tut-injected-accent-style';
      document.head.appendChild(el);
    }
    el.innerHTML = \`
      :root {
        --ant-color-primary: \${color} !important;
        --ant-color-primary-hover: \${color} !important;
        --ant-color-primary-active: \${color} !important;
        --ant-color-link: \${color} !important;
        --ant-color-link-hover: \${color} !important;
        --primary-color: \${color} !important;
      }
      .ant-btn-primary, button[type="submit"].ant-btn {
        background-color: \${color} !important;
        border-color: \${color} !important;
        color: #1a1204 !important;
      }
    \`;
  }

  var initialAccent = '#F5C242';
  try {
    initialAccent = localStorage.getItem('mcit-accent-color') || '#F5C242';
  } catch(e) {}
  applyAccent(initialAccent);

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'MCIT_ACCENT_CHANGE' && e.data.accent) {
      applyAccent(e.data.accent);
    }
  });
})();
</script>
`;

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="tut-accent-sync"')) {
    content = content.replace('<head>', '<head>' + accentSyncScript);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Injected accent-sync into ${file}`);
  } else {
    console.log(`Accent-sync already present in ${file}`);
  }
}
