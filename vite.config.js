import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/frontend'),
      '@shared': resolve(__dirname, './src/shared'),
      '@frontend': resolve(__dirname, './src/frontend'),
      '@backend': resolve(__dirname, './src/backend'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    // Add cache busting with content hash
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
