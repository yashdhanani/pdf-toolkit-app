// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { presetUno, presetAttributify, presetIcons } from 'unocss';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pdf-toolkit/', // IMPORTANT: Replace 'pdf-toolkit' with your GitHub repository name
  plugins: [
    react(),
    UnoCSS({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
      ],
    }),
  ],
});