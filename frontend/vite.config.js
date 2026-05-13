import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le proxy redirige /api/* vers le serveur Express en local.
// Avantage : le frontend appelle "/api/projects" (relatif)
// au lieu de "http://localhost:5000/api/projects" (absolu).
// En production, on configure le vrai domaine backend à la place.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
