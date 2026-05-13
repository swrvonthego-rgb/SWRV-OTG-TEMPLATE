import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { devApiPlugin } from './scripts/dev-api-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Make GROQ_API_KEY available to the dev API plugin process
  if (env.GROQ_API_KEY) {
    process.env.GROQ_API_KEY = env.GROQ_API_KEY;
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), devApiPlugin()],
    define: {
      // ⚠️  Do NOT put API keys here — they get embedded in the compiled JS bundle
      // All secrets live in Cloudflare Worker environment variables only
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
