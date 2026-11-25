import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](three|@react-three|three-stdlib|suspend-react|its-fine|zustand|troika)[\\/]/.test(id)) {
              return 'vendor-three';
            }
            if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
              return 'vendor-framer';
            }
            if (/[\\/](lucide-react|react-icons)[\\/]/.test(id)) {
              return 'vendor-icons';
            }
            if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
