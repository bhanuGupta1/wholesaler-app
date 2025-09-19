import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000 },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
  optimizeDeps: { include: ['react', 'react-dom'] },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js', // make sure this file exists
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      exclude: ['node_modules/', 'src/test/', '**/*.config.js', 'dist/', 'build/', 'public/'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
