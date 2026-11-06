import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Local dev reads the live map feed. /v is not proxied, so local page loads send no alerts.
    proxy: { '/map': { target: 'https://hello.siddharthkrishna.com', changeOrigin: true } },
  },
})
