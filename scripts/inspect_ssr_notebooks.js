const fs = require('fs');

const ssrPath = '/app/frontend/.next/server/chunks/ssr/src_app_(dashboard)_notebooks_page_tsx_09i8ha6._.js';
if (fs.existsSync(ssrPath)) {
  const content = fs.readFileSync(ssrPath, 'utf8');
  console.log('SSR chunk length:', content.length);
  const idx = content.indexOf('notebooks.title');
  console.log('notebooks.title at:', idx);
  console.log('Surrounding code:');
  console.log(content.slice(Math.max(0, idx - 200), idx + 300));
}
