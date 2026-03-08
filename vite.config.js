import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Forward CMS adapter requests to the local Umbraco instance during development.
      // Override target with CMS_API_URL env var when the CMS runs on a non-default port.
      '/api/content': {
        target: process.env.CMS_API_URL || 'http://localhost:13802',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist'
  }
});

