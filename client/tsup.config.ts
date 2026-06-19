import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'browser',
  noExternal: [/(.*)/],
  sourcemap: true,
  dts: true,
  clean: true,
  treeshake: true,
  minify: true
});
