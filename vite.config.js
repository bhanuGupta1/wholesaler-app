import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    headers: {
      // Security headers for development
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://www.googleapis.com wss://; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
    }
  },
  build: {
    outDir: 'dist',
    // Remove comments and minimize bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console statements
        drop_console: true,
        drop_debugger: true,
        // Remove comments
        comments: false
      },
      format: {
        // Remove all comments
        comments: false,
        // Remove ASCII art and decorative comments
        ascii_only: true
      },
      mangle: {
        // Obfuscate function and variable names
        toplevel: true
      }
    },
    rollupOptions: {
      output: {
        // Remove comments in production build
        banner: '',
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          router: ['react-router-dom']
        },
        // Remove source map comments and minimize file info
        sourcemapExcludeSources: true,
        // Use consistent naming without timestamps
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Don't generate source maps in production
    sourcemap: false
  },
  // Define the entry point explicitly
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // Test configuration for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    // Include test files
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // Exclude files from test coverage
    coverage: {
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        'dist/',
        'build/',
        'public/'
      ],
      reporter: ['text', 'json', 'html']
    }
  }
});