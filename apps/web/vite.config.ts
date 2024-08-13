import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';

dotenv.config({ path: resolve(__dirname, '../../.env') });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envPrefix: 'API_BASE_URL',
});
