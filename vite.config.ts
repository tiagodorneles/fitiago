import {
  fileURLToPath,
  URL,
} from 'node:url'

import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/fitiago/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
