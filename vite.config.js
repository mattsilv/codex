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
    // Ensure proper support for Cloudflare Workers
    target: 'esnext',
    // Add cache busting with content hash
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      external: [
        // External dependencies that are causing bundling issues
        'lucia/utils',
        '@lucia-auth/oauth/dist/core/oauth2',
        '@lucia-auth/oauth/dist/providers/azure-ad',
        '@lucia-auth/oauth/dist/providers/slack'
      ]
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
