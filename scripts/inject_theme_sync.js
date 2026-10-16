const fs = require('fs');
const path = require('path');

const targetSnippet = `        var theme = 'system';
        try {
          theme = localStorage.getItem('theme') || 'system';
        } catch (_) {}
        var systemTheme =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        var resolvedTheme = theme === 'system' ? systemTheme : theme;
        if (resolvedTheme === 'dark' || resolvedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', resolvedTheme);
        }`;

const replacementSnippet = `        var queryTheme = new URLSearchParams(location.search).get('theme');
        if (queryTheme === 'dark' || queryTheme === 'light') {
          try {
            localStorage.setItem('theme', queryTheme);
          } catch (_) {}
        }
        var theme = 'system';
        try {
          theme = (queryTheme === 'dark' || queryTheme === 'light') ? queryTheme : (localStorage.getItem('theme') || 'system');
        } catch (_) {}
        var systemTheme =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        var resolvedTheme = theme === 'system' ? systemTheme : theme;
        if (resolvedTheme === 'dark' || resolvedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', resolvedTheme);
        }

        window.addEventListener('message', function (e) {
          if (e.data && (e.data.type === 'MCIT_THEME_CHANGE' || e.data.type === 'THEME_CHANGE')) {
            var t = e.data.theme;
            if (t === 'dark' || t === 'light') {
              try {
                localStorage.setItem('theme', t);
              } catch (_) {}
              document.documentElement.setAttribute('data-theme', t);
              window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: t }));
            }
          }
        });`;

// Escaped versions for compiled js string templates (\n instead of actual newlines)
function replaceInContent(content) {
  let modified = false;

  if (content.includes(targetSnippet)) {
    content = content.replace(targetSnippet, replacementSnippet);
    modified = true;
  }

  // Also handle single-line escaped strings inside js bundles
  const escapedTarget = targetSnippet.split('\n').join('\\n');
  const escapedReplacement = replacementSnippet.split('\n').join('\\n');
  if (content.includes(escapedTarget)) {
    content = content.replace(escapedTarget, escapedReplacement);
    modified = true;
  }

  return { content, modified };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] Not found: ${filePath}`);
    return;
  }

  try {
    const original = fs.readFileSync(filePath, 'utf8');
    const { content, modified } = replaceInContent(original);
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[UPDATED] ${filePath}`);
    } else {
      if (original.includes('MCIT_THEME_CHANGE')) {
        console.log(`[ALREADY SYNCED] ${filePath}`);
      } else {
        console.log(`[TARGET NOT FOUND] ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`[ERROR] ${filePath}:`, err.message);
  }
}

function findAndProcessRouteCache(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAndProcessRouteCache(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.body') || entry.name.endsWith('.html') || entry.name.endsWith('.js'))) {
      processFile(fullPath);
    }
  }
}

const directFiles = [
  '/app/dist/desktop/index.html',
  '/app/dist/mobile/index.mobile.html',
  '/app/.next/server/chunks/src_app_spa_[variants]_[[___path]]_spaHtmlTemplates_ts_1_hish0._.js',
  '/app/.next/server/chunks/src_app_spa-auth_authHtmlTemplate_ts_1k_qey9._.js'
];

console.log('Starting theme sync injection...');
for (const file of directFiles) {
  processFile(file);
}

console.log('Checking route-cache...');
findAndProcessRouteCache('/app/.next/server/route-cache');

console.log('Theme sync injection finished.');
