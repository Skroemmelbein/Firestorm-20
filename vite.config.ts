import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client'),
      '@server': path.resolve(__dirname, 'server'),
      '@routes': path.resolve(__dirname, 'server/routes'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
