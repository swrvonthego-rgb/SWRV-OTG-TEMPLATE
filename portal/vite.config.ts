import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Serve the portal under /portal/ so it shares the swrvonthego.pro domain
  // with the main site — enabling shared Supabase auth via the same localStorage.
  base: '/portal/',
  build: {
    outDir: '../dist/portal',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5174,
  },
});
