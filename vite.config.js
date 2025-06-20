import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
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