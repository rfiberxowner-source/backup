import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/expo-push': {
        target: 'https://exp.host/--/api/v2/push/send',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/expo-push/, '')
      }
    }
  }
});
