import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig({
  base: './',                 //  << SIN lógica de mode
  server: { host: '::', port: 8080 },
  plugins: [
    react(),
    componentTagger(),        // tagger solo añade comentarios, no afecta build
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});



