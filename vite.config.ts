import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0', // Allow all hosts
    port: 5173,
    strictPort: false,
    cors: true
    // Remove HTTPS for now to avoid SSL issues
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          crypto: ['libsodium-wrappers', '@noble/curves', '@noble/ciphers', '@noble/hashes'],
          networking: ['simple-peer'],
          react: ['react', 'react-dom'],
          vendor: ['joi']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': process.env
  },
  optimizeDeps: {
    include: ['libsodium-wrappers', 'buffer']
  },
  resolve: {
    alias: {
      events: 'events',
      util: 'util',
      stream: 'stream-browserify',
      buffer: 'buffer'
    }
  }
})
