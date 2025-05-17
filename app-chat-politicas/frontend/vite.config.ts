import path from 'path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

const plugins = [react(), splitVendorChunkPlugin(), basicSsl()];

// https://vitejs.dev/config/
export default defineConfig({
    base: '/chatia/',
    plugins: [...plugins],
    preview: {
        port: 8080,
        strictPort: true
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    define: {
        'process.env': {
            BACKEND_URL: 'https://operationhub-dev.pwcinternal.com/api/chat-ia',
            // BACKEND_URL: 'http://localhost:8000',
            WORKERS_API: 'https://operationhub-dev.pwcinternal.com/api/workers/v1/workers',
            // WORKERS_API: 'http://localhost:4000/workers'
            VITE_GRAPH_USER_PHOTO_URL: 'https://graph.microsoft.com/v1.0/me/photo/'
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                    if (id.includes('src/pages/')) {
                        const match = id.match(/src\/pages\/(.*)\//);
                        return match ? match[1] : 'main';
                    }
                }
            }
        },
        // Añadir configuración específica para el build
        assetsDir: 'assets',
        manifest: true,
        outDir: 'dist',
        emptyOutDir: true
    },
    server: {
        port: 8080,
        strictPort: true,
        host: true
    }
});
