import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  server: {
    port: 5174,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/apps/portfolio-chat',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/mount.tsx'),
      name: 'PortfolioChat',
      fileName: () => 'portfolio-chat.js',
      formats: ['es', 'umd'],
    },
  },
});
