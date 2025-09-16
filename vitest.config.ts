import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
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
    // Configure timeouts for tests
    testTimeout: 30000,
    hookTimeout: 30000,
    // Use different environments for different test types
    environmentMatchGlobs: [
      ['tests/**/nuxt*.test.ts', 'node'],
      ['tests/**/*.test.ts', 'jsdom'],
    ],
  },
})
