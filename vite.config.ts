import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import json2TS from './plugins/json-to-ts';
import mockData from './examples/mock.json';

// import autoTracker from './plugins/autoTracker';
// import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // autoTracker({ libName: 'AutoLogger', libPath: path.resolve(__dirname, 'lib/auto-logger')}), 
    react(),
    json2TS({ 
      path: path.resolve('api-typings'),
      filename: "index.ts",
      dataSource: mockData
    })
  ]
})
