import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Mantém o fix para 'global'
  },
  server: {
    proxy: {
      // PROXY 1: Para obter o Access Token do Twitch (Auth)
      '/twitch-auth-proxy': {
        target: 'https://id.twitch.tv',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/twitch-auth-proxy/, ''),
      },
      // PROXY 2: Para as requisições de dados da API IGDB
      '/igdb-proxy': {
        target: 'https://api.igdb.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/igdb-proxy/, ''),
      }
    }
  }
})