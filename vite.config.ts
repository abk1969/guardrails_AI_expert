import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const port = parseInt(process.env.VITE_PORT || env.VITE_PORT || '5080', 10);
    return {
      server: {
        port,
        host: '0.0.0.0',
        hmr: {
          // In Docker, use the external port for WebSocket connections
          clientPort: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT, 10) : port,
        },
        fs: {
          // Don't scan the guardrail directory
          deny: ['**/guardrail/**'],
        },
      },
      plugins: [react()],
      // ⚠️ SÉCURITÉ: Ne JAMAIS exposer de clés API côté client!
      // Les appels à Gemini doivent passer par le backend
      define: {
        // Exposer uniquement l'URL du backend
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api/v1'),
        'import.meta.env.VITE_MCP_API_URL': JSON.stringify(env.VITE_MCP_API_URL || 'http://localhost:3001/api/v1/mcp'),
        'import.meta.env.VITE_MCP_MOCK_MODE': JSON.stringify(env.VITE_MCP_MOCK_MODE || 'false'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
    };
});
