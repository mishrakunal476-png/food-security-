import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: [
      '8328-i7ut5g5lm4jinlgtsqg8t6-3b9c6e13.sg2.manus.computer',
      '3000-i7ut5g5lm4jinlgtsqg8t6-3b9c6e13.sg2.manus.computer',
    ],
  },
});
