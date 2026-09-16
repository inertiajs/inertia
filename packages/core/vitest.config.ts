import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Browser globals must stand before the modules that read them are imported.
    setupFiles: ['./tests/support/browser.ts'],
  },
})
