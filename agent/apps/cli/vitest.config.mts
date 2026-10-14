import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Importing `@tut/agent-runtime` pulls in `@tut/context-engine`,
    // which reaches `@tut/agent-templates` and its `.md` prompt files.
    // Vitest would otherwise try to parse the Markdown as JavaScript. Mirrors
    // the root config's `raw-md` plugin; the content is irrelevant to the CLI.
    {
      name: 'raw-md',
      transform(_code: string, id: string) {
        if (id.endsWith('.md')) return { code: 'export default ""', map: null };
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: '@tut/device-gateway-client',
        replacement: path.resolve(__dirname, '../../packages/device-gateway-client/src/index.ts'),
      },
      {
        find: /^@tut\/local-file-shell$/,
        replacement: path.resolve(__dirname, '../../packages/local-file-shell/src/index.ts'),
      },
      {
        find: '@tut/file-loaders',
        replacement: path.resolve(__dirname, '../../packages/file-loaders/src/index.ts'),
      },
      {
        find: '@tut/tool-runtime',
        replacement: path.resolve(__dirname, '../../packages/tool-runtime/src/index.ts'),
      },
    ],
  },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/**/*.test.ts', '*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // Suppress unhandled rejection warnings from Commander async actions with mocked process.exit
    onConsoleLog: () => true,
  },
});
