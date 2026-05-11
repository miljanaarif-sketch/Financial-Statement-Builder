import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/upload': 'http://localhost:8000',
      '/mapping': 'http://localhost:8000',
      '/statements': 'http://localhost:8000',
      '/notes': 'http://localhost:8000',
      '/export': 'http://localhost:8000',
    },
  },
})
