
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // CRÍTICO: Faz os caminhos serem relativos (./) e não absolutos (/)
  server: {
    port: 3000,
  },
});
