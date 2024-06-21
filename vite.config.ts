import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      entry: './src/index.ts',
      name: 'decorators',
      formats: ['es'],
      fileName: 'index',
    },
  },
  esbuild: {
    target: 'es2022',
    keepNames: true,
  },
  plugins: [dts({ entryRoot: 'src', rollupTypes: true })],
});
