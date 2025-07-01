import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  base: '/pdf-toolkit-app/',
  plugins: [
    react(),
    UnoCSS({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
      ],
      safelist: [
        // List of static classes you use anywhere in your app
        'text-center',
        'text-red-500',
        'text-blue-500',
        'bg-white',
        'bg-gray-100',
        'p-4',
        'px-4',
        'py-2',
        'rounded',
        'rounded-lg',
        'flex',
        'items-center',
        'justify-center',
        'text-lg',
        'text-sm',
        'font-bold',
        'gap-4',
        'mt-4',
        'mb-4',
        'border',
        'border-gray-300',
      ]
    }),
  ],
});
