import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import igdbApi from './api/igdb.js'

function localServerlessApi() {
  return {
    name: 'local-serverless-api',
    configureServer(server) {
      server.middlewares.use('/api/igdb', async (request, response) => {
        try {
          const body = await new Promise((resolve, reject) => {
            const chunks = []
            request.on('data', chunk => chunks.push(chunk))
            request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            request.on('error', reject)
          })
          const webRequest = new Request('http://localhost/api/igdb', {
            method: request.method,
            headers: request.headers,
            body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
          })
          const webResponse = await igdbApi.fetch(webRequest)
          response.statusCode = webResponse.status
          webResponse.headers.forEach((value, key) => response.setHeader(key, value))
          response.end(Buffer.from(await webResponse.arrayBuffer()))
        } catch (error) {
          console.error('Local IGDB route error:', error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: 'Erro ao executar a busca local.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
  plugins: [react(), localServerlessApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('firebase')) return 'vendor-firebase'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('@hello-pangea')) return 'vendor-dnd'
          if (/node_modules[\\/]react(?:-dom)?[\\/]/.test(id) || id.includes('node_modules/scheduler')) return 'vendor-react'
          return undefined
        },
      },
    },
  },
  define: {
    global: 'window', // Mantém o fix para 'global'
  },
  }
})
