const fs = require('fs');

const f = '/app/.next/server/chunks/packages_locales_src_default_setting_ts_0oe2f67._.js';
if (fs.existsSync(f)) {
  const c = fs.readFileSync(f, 'utf8');
  const idx = c.indexOf('tools.builtins.mcit');
  if (idx !== -1) console.log(c.slice(idx - 30, idx + 200));
}
