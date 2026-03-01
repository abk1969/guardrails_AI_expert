import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const port = parseInt(process.env.VITE_PORT || env.VITE_PORT || '5080', 10);
    // Get HMR port from environment (set in docker-compose.yml)
    const hmrPort = parseInt(process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || '3004', 10);
    const isDev = mode === 'development';
    
    return {
      // Ensure base path is correct
      base: '/',
      // Public directory
      publicDir: 'public',
      server: {
        port,
        host: '0.0.0.0', // Listen on all interfaces
        strictPort: true,
        // Disable automatic browser opening
        open: false,
        // Enable CORS for development
        cors: true,
        hmr: isDev ? {
          port: hmrPort,
          clientPort: hmrPort,
        } : false,
        // Middleware configuration
        middlewareMode: false,
        watch: isDev ? {
          usePolling: true,
          interval: 5000,
          binaryInterval: 5000,
          ignored: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.git/**',
            '**/guardrail/**',
            '**/backend/**',
            '**/strix-output/**',
            '**/*.log',
            '**/.cache/**',
            '**/.vite/**',
            '**/coverage/**',
            '**/test-results/**',
            '**/*.md',
            '**/scripts/**',
            '**/infrastructure/**',
            '**/data/**',
            '**/data_ai_risk/**',
            '**/public/**',
            // Completely ignore config files to prevent restart loops
            '**/*config*',
          ],
        } : undefined,
        fs: {
          // Don't scan the guardrail directory and other large directories
          deny: ['**/guardrail/**', '**/node_modules/**', '**/.git/**'],
          // Allow access to necessary directories
          allow: ['..'],
        },
      },
      plugins: [
        react({
          // Optimize React refresh
          fastRefresh: true,
        }),
      ],
      build: {
        // Optimize build performance
        target: 'esnext',
        minify: isDev ? false : 'esbuild', // Don't minify in dev for faster builds
        sourcemap: false, // Disable sourcemaps for faster builds
        cssCodeSplit: true, // Split CSS for better caching
        rollupOptions: {
          output: {
            // Better code splitting
            manualChunks: (id) => {
              // Split node_modules into separate chunks
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('lucide-react')) {
                  return 'ui-vendor';
                }
                if (id.includes('socket.io')) {
                  return 'socket-vendor';
                }
                // Other node_modules
                return 'vendor';
              }
            },
          },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 500,
        // Reduce build time
        reportCompressedSize: false,
      },
      optimizeDeps: {
        // Pre-bundle dependencies for faster dev server startup
        include: [
          'react',
          'react-dom',
          'lucide-react',
          'socket.io-client',
        ],
        // Don't exclude @vite/client - it's needed for HMR
        exclude: ['@vite/env'],
        // Force optimization
        force: false,
        // Ensure Vite client is available
        esbuildOptions: {
          target: 'esnext',
        },
      },
      // Disable sourcemaps in dev for faster compilation
      esbuild: {
        sourcemap: false,
      },
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
