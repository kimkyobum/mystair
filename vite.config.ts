import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey =
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env.GOOGLE_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  const geminiKey2 =
    env.VITE_GEMINI_API_KEY2 ||
    env.GEMINI_API_KEY2 ||
    process.env.VITE_GEMINI_API_KEY2 ||
    process.env.GEMINI_API_KEY2 ||
    '';
  const geminiKey3 =
    env.VITE_GEMINI_API_KEY3 ||
    env.GEMINI_API_KEY3 ||
    process.env.VITE_GEMINI_API_KEY3 ||
    process.env.GEMINI_API_KEY3 ||
    '';
  const geminiKey4 =
    env.VITE_GEMINI_API_KEY4 ||
    env.GEMINI_API_KEY4 ||
    process.env.VITE_GEMINI_API_KEY4 ||
    process.env.GEMINI_API_KEY4 ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY2': JSON.stringify(geminiKey2),
      'process.env.GEMINI_API_KEY3': JSON.stringify(geminiKey3),
      'process.env.GEMINI_API_KEY4': JSON.stringify(geminiKey4),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
