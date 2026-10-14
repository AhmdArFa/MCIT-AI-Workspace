import { build, type Plugin } from 'vite';
import { describe, expect, it } from 'vitest';

import { tutIconImports } from './tutIconImports';

const ENTRY_ID = '\0tut-icon-imports-fixture.mjs';

const fixturePlugin: Plugin = {
  name: 'tut-icon-imports-fixture',
  load(id) {
    if (id !== ENTRY_ID) return;

    return `
      import { MCP, toc } from '@mcit-vendor/icons';
      export { MCP, toc };
    `;
  },
  resolveId(id) {
    if (id === 'virtual:tut-icon-imports-fixture') return ENTRY_ID;
  },
};

describe('tutIconImports', () => {
  it('keeps icon barrel dependencies out of transformed .mjs modules', async () => {
    const result = await build({
      build: {
        minify: false,
        rolldownOptions: {
          external: /^@mcit-vendor\/icons\/es\//,
          input: 'virtual:tut-icon-imports-fixture',
        },
        write: false,
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [fixturePlugin, ...tutIconImports()],
    });

    const outputs = Array.isArray(result) ? result : [result];
    const code = outputs
      .flatMap(({ output }) => output)
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');

    expect(code).toContain('@mcit-vendor/icons/es/MCP/index.js');
    expect(code).toContain('@mcit-vendor/icons/es/toc.js');
    expect(code).not.toMatch(/from ["']@mcit-vendor\/icons["']/);
  });
});
