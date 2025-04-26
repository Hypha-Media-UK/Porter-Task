import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Changed from 3000 to avoid conflict with Express server
    open: true,
    proxy: {
      // Proxy API requests to Express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
