import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Your personal library (playlists + liked songs) -> json-server on :3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Lyrics come from the free lyrics.ovh API. We proxy it to avoid CORS
      // in the browser. Example: /lyrics/v1/Coldplay/Yellow
      '/lyrics': {
        target: 'https://api.lyrics.ovh',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lyrics/, '')
      }
    }
  }
})
