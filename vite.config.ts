import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // Ensure relative paths for GitHub Pages
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'https://i.ibb.co/wZY6D3g2/logo-e.png', 'mask-icon.svg'],
        manifest: {
          name: 'SIS EEMP',
          short_name: 'SIS EEMP',
          description: 'Sistema de autenticação para acesso ao portal do aluno',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: './',
          start_url: './',
          icons: [
            {
              src: 'https://i.ibb.co/wZY6D3g2/logo-e.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://i.ibb.co/wZY6D3g2/logo-e.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
