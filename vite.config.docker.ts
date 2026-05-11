import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  publicDir: 'public',
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: false,
    cors: true,
    // Simplified HMR for Docker
    hmr: {
      clientPort: 3004,
    },
  },
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api/v1'),
    'import.meta.env.VITE_MCP_API_URL': JSON.stringify(process.env.VITE_MCP_API_URL || 'http://localhost:3001/api/v1/mcp'),
    'import.meta.env.VITE_MCP_MOCK_MODE': JSON.stringify(process.env.VITE_MCP_MOCK_MODE || 'false'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
});
