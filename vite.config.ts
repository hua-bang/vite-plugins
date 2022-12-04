import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoTracker from './plugins/autoTracker';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    autoTracker({ libName: 'AutoLogger', libPath: path.resolve(__dirname, 'lib/auto-logger')}), 
    react()
  ]
})
