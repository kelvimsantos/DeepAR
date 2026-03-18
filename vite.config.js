import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  base: '/', // ← adicione esta linha
  server: {
    host: true,
    https: true,
    port: 5173,
  },
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/rapier'
    ],
    exclude: ['@react-three/xr'],
  },
});