import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    hmr: {
      overlay: true,
    },
    headers: {
      'Permissions-Policy': 'accelerometer=(self "https://checkout.razorpay.com"), gyroscope=(self "https://checkout.razorpay.com"), magnetometer=(self "https://checkout.razorpay.com"), devicemotion=(self "https://checkout.razorpay.com"), deviceorientation=(self "https://checkout.razorpay.com")'
    },
 proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (err.code === 'ECONNREFUSED') return;
            console.error('proxy error', err);
          });
        },
      },
      // Proxy static assets (logos, product images, etc.) from backend
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('react-icons')) {
              return 'icon-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-hot-toast'],
    exclude: [],
  },
})
