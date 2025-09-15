import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'import.meta.env.VITE_NAVER_MAP_CLIENT_ID': JSON.stringify('it3tbo5evp'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:3000/api')
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    exclude: ['msw']
  }
})
