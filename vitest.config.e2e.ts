import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const timeout = process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './components/test-utils'),
    },
  },
  test: {
    include: ['./components/**/*.spec.[tj]s'],
    setupFiles: ['./components/vitestSetup.ts'],
    globalSetup: ['./components/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    reporters: 'dot',
    onConsoleLog(log) {
      if (log.match(/experimental|jit engine|emitted file|tailwind/i))
        return false
    },
  },
  esbuild: {
    target: 'node14',
  },
})
