import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@tenant': path.resolve(__dirname, 'src/tenant'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@app': path.resolve(__dirname, 'src/app'),
    },
  },
  server: {
    port: 3000,
    host: true, // listen on 0.0.0.0 so neosoft-pm.indi4.io (127.0.0.1) can connect
    allowedHosts: ['neosoft-pm.indi4.io', 'pm.indi4.io'],
  },
});
