import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          materials: path.resolve(__dirname, 'materials.html'),
          gurgaon: path.resolve(__dirname, 'gurgaon.html'),
          noida: path.resolve(__dirname, 'noida.html'),
          bangalore: path.resolve(__dirname, 'bangalore.html'),
          chennai: path.resolve(__dirname, 'chennai.html'),
          hyderabad: path.resolve(__dirname, 'hyderabad.html'),
          coimbatore: path.resolve(__dirname, 'coimbatore.html'),
        },
      },
    },
  };
});
