import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    port: 4173,
    open: true
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@models': new URL('./src/models', import.meta.url).pathname,
      '@services': new URL('./src/services', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@styles': new URL('./src/styles', import.meta.url).pathname
    }
  }
});