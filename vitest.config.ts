import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      include: ['src/**/*'],
      reporter: ['text', 'json-summary', 'cobertura'],
    },
    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions', 'junit'] : ['dot'],
    outputFile: {
      junit: './test-results.xml',
    },
  },
})
