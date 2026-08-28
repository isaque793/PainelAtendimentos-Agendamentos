import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["4173-ikkzudhucscabohqok7n2-09699d94.us2.manus.computer"],
  },
})
