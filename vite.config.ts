import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts({ rollupTypes: true, tsconfigPath: 'tsconfig.app.json' }), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      'vue3-flashcards': resolve(__dirname, 'src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FlashCards',
      // formats: ['es', 'umd'],
      // fileName: format => `flashcards.${format}.js`,
      fileName: 'flashcards',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
