// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { presetUno, presetAttributify, presetIcons } from 'unocss';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pdf-toolkit-app/', // <--- CRITICAL FIX: Set base to your GitHub repo name with trailing slash
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
