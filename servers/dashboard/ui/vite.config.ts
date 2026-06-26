import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  base: '/',
  publicDir: path.resolve(__dirname, '../public'),
  build: {
    outDir: path.resolve(__dirname, '../dist/public'),
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/event': {
        target: 'http://127.0.0.1:7890',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:7890',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:7890',
        ws: true,
      },
    },
  },
});
