import { defineConfig } from 'vite';

import { name } from './package.json';


export default defineConfig({
  root: './',
  publicDir: './dist',
  plugins: [
    {
      apply: 'serve',
      name: 'restart-on-dist-change',
      handleHotUpdate: ({ server }) => server.restart(),
    }
  ],
  build: {
    sourcemap: false,
    outDir: './dist',
    emptyOutDir: false,
    lib: {
      name,
      formats: ['es'],
      fileName: () => `index.js`,
      entry: './src/extension.ts',
    },
    watch: {
      exclude: ['./node_modules/**/*', './dist/**/*', './views/**/*'],
    },
  },
  server: {
    port: 5555,
    cors: { origin: '*' },
  },
});
