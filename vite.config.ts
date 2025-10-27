import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5080,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // ⚠️ SÉCURITÉ: Ne JAMAIS exposer de clés API côté client!
      // Les appels à Gemini doivent passer par le backend
      define: {
        // Exposer uniquement l'URL du backend
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api/v1'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
