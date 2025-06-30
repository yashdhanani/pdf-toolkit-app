// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  base: '/pdf-toolkit-app/', // ✅ MUST match your GitHub repo name!
  plugins: [
    react(),
    UnoCSS({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
      ],
      safelist: [
        // 🔒 Add all the class names used via JS or dynamically here:
        'grid', 'gap-4', 'rounded', 'text-center', 'text-lg', 'font-semibold',
        'hover:bg-gray-100', 'transition', 'duration-300', 'shadow',
        'border', 'p-4', 'bg-white', 'w-full', 'md:grid-cols-5',
        'text-xs', 'text-gray-500', 'hover:shadow-lg',
      ],
    }),
  ],
});
