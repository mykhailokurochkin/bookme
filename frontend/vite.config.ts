import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        '/auth': {
          target: env.VITE_API_BASE_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  }
})
