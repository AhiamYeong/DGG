import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/naver': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/naver/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-datepicker'],
          
          // Feature chunks
          'map-features': [
            './src/hooks/useMapInitialization.ts',
            './src/hooks/useMapLocation.ts',
            './src/hooks/useMarker.ts',
            './src/hooks/usePolyline.ts'
          ],
          'search-features': [
            './src/api/placeSearchApi.ts',
            './src/hooks/useNaverSearch.ts',
            './src/hooks/usePlaceSearch.ts'
          ],
          'route-features': [
            './src/api/routeService.ts',
            './src/utils/routeDataGenerator.ts',
            './src/components/route/SideSheet.tsx'
          ],
          'stores': [
            './src/stores/useRouteStore.ts',
            './src/stores/useRouteSearchStore.ts',
            './src/stores/useNavigationStore.ts',
            './src/stores/useSearchStore.ts'
          ]
        }
      }
    }
  }
})
