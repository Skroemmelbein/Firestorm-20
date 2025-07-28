import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, 'server'),
      '@routes': path.resolve(__dirname, 'server/routes'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})
