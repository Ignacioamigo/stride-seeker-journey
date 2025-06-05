import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // 👇 ESTA línea hace que los assets se busquen de forma relativa
  //    (funciona tanto en el simulador como dentro del .app de Capacitor)
  base: '',

  server: {
    host: '::',
    port: 8080,
  },

  plugins: [
    react(),
    // Solo añade el tagger en modo desarrollo
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));

