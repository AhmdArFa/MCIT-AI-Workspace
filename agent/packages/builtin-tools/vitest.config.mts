import { defineConfig } from 'vitest/config';
import { vendorPath } from '../vendor-bridge/scope.mjs';

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        inline: [vendorPath()],
      },
    },
  },
});
