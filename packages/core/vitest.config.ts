import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The layer suites drive the router end to end, which needs the browser globals in place before
    // the modules that read them are imported.
    setupFiles: ['./tests/support/browser.ts'],
  },
})
