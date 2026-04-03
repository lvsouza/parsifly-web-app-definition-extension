import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import { name } from './package.json';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '',
  root: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    emptyOutDir: true, // limpa o destino antes do build
    outDir: `../../dist/views/${name}`, // pasta fora do diretório atual
    watch: mode === 'buildOnly' ? null : {
      exclude: ['./node_modules']
    },
    rollupOptions: {
      output: mode === 'buildOnly'
        ? undefined
        : {
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name].js'
        }
    },
  },
}))
