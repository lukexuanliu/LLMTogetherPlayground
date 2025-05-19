import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './client/src')
      },
      {
        find: '@shared',
        replacement: resolve(__dirname, './shared')
      },
      {
        find: '@server',
        replacement: resolve(__dirname, './server')
      }
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/tests/**',
        '**/mocks/**',
        '**/types/**',
        '**/vite.ts',
        '**/index.ts'
      ],
      all: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      clean: true
    },
    setupFiles: [],
    testTimeout: 30000, // Increased timeout for integration tests
    hookTimeout: 30000, // Increased timeout for hooks
    server: {
      deps: {
        inline: ['@server/**']
      }
    }
  }
})
