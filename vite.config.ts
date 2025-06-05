import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  // 👇 usar './' obliga a Vite a generar <script src="./assets/xxx.js">
  base: mode === 'production' ? './' : '/',   // ← cambio clave

  server: { host: '::', port: 8080 },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
}));


