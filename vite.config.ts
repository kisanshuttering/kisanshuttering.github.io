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
          'scaffolding-rental-gurgaon': path.resolve(__dirname, 'scaffolding-rental-gurgaon.html'),
          'scaffolding-rental-noida': path.resolve(__dirname, 'scaffolding-rental-noida.html'),
          'scaffolding-rental-farukhnagar': path.resolve(__dirname, 'scaffolding-rental-farukhnagar.html'),
          'scaffolding-rental-jaipur': path.resolve(__dirname, 'scaffolding-rental-jaipur.html'),
          'scaffolding-rental-kota': path.resolve(__dirname, 'scaffolding-rental-kota.html'),
          blog: path.resolve(__dirname, 'blog.html'),
          'blog-scaffolding-safety-checklist': path.resolve(__dirname, 'blog-scaffolding-safety-checklist.html'),
          'blog-shuttering-vs-shoring': path.resolve(__dirname, 'blog-shuttering-vs-shoring.html'),
          'blog-cuplock-scaffolding-advantages': path.resolve(__dirname, 'blog-cuplock-scaffolding-advantages.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
