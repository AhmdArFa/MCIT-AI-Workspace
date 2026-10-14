import { build, type Plugin } from 'vite';
import { describe, expect, it } from 'vitest';

import { tutUiImports, parseBarrel } from './tutUiImports';

const ENTRY_ID = '\0tut-ui-imports-fixture.mjs';

const fixturePlugin: Plugin = {
  name: 'tut-ui-imports-fixture',
  load(id) {
    if (id !== ENTRY_ID) return;

    return `
      import { ConfigProvider, ErrorBoundary, Flexbox } from '@mcit-vendor/ui';
      import { Button } from '@mcit-vendor/ui/base-ui';
      export { ConfigProvider, ErrorBoundary, Flexbox, Button };
      export * from '@mcit-vendor/ui/brand';
      export const loadToast = () => import('@mcit-vendor/ui/base-ui');
    `;
  },
  resolveId(id) {
    if (id === 'virtual:tut-ui-imports-fixture') return ENTRY_ID;
  },
};

describe('parseBarrel', () => {
  it('maps exported members to their source modules', () => {
    const code = [
      'import FlexBasic_default from "./Flex/FlexBasic.mjs";',
      'import Foo, { bar, baz as qux } from "./Foo/index.mjs";',
      'import { rehypeStreamAnimated } from "@mcit-vendor/streamdown";',
      'export { FlexBasic_default as Flexbox, Foo, bar, qux, rehypeStreamAnimated };',
    ].join('\n');

    expect(parseBarrel(code, '')).toEqual({
      Flexbox: { imported: 'default', source: '@mcit-vendor/ui/es/Flex/FlexBasic' },
      Foo: { imported: 'default', source: '@mcit-vendor/ui/es/Foo/index' },
      bar: { imported: 'bar', source: '@mcit-vendor/ui/es/Foo/index' },
      qux: { imported: 'baz', source: '@mcit-vendor/ui/es/Foo/index' },
      rehypeStreamAnimated: { imported: 'rehypeStreamAnimated', source: '@mcit-vendor/streamdown' },
    });
    expect(parseBarrel('import X from "../Foo/X.mjs";\nexport { X };', 'chat/')).toEqual({
      X: { imported: 'default', source: '@mcit-vendor/ui/es/Foo/X' },
    });
  });
});

describe('tutUiImports', () => {
  it('rewrites barrel imports to deep imports', async () => {
    const result = await build({
      build: {
        minify: false,
        rolldownOptions: {
          external: [/^@mcit-vendor\/ui\/es\//, /node_modules\/react-error-boundary\//],
          input: 'virtual:tut-ui-imports-fixture',
        },
        write: false,
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [fixturePlugin, ...tutUiImports()],
    });

    const outputs = Array.isArray(result) ? result : [result];
    const code = outputs
      .flatMap(({ output }) => output)
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');

    expect(code).toContain('@mcit-vendor/ui/es/ConfigProvider/');
    expect(code).toContain('@mcit-vendor/ui/es/Flex/FlexBasic');
    expect(code).toContain('@mcit-vendor/ui/es/base-ui/');
    expect(code).toContain('react-error-boundary');
    expect(code).not.toMatch(/from ["']react-error-boundary["']/);
    expect(code).not.toMatch(/from ["']@mcit-vendor\/ui["']/);
    expect(code).not.toMatch(/from ["']@mcit-vendor\/ui\/base-ui["']/);
    expect(code).toContain('@mcit-vendor/ui/es/brand/index');
    expect(code).toContain('@mcit-vendor/ui/es/base-ui/index');
  });
});
