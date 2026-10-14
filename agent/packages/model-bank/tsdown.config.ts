import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    alwaysBundle: ['@tut/business-const'],
  },
  dts: true,
  entry: [
    'src/index.ts',
    'src/modelProviders/index.ts',
    'src/modelProviders/mcit.ts',
    'src/types/index.ts',
    'src/aiModels/*.ts',
  ],
  fixedExtension: false,
  format: ['esm'],
  outDir: 'dist',
  platform: 'neutral',
  target: 'es2022',
  tsconfig: './tsconfig.json',
});
