import { defineConfig, devices } from '@playwright/test'

// define process env for TS
declare const process: {
  argv: string[]
  env: {
    BROWSER?: 'chromium' | 'webkit'
    CI?: boolean
    PACKAGE?: 'vue3' | 'react' | 'svelte'
    SSR?: 'true'
  }
  platform: string
}

const adapter = process.env.PACKAGE || 'vue3'
const runsInCI = !!process.env.CI
const runsOnMac = process.platform === 'darwin'
const ssrEnabled = process.env.SSR === 'true'

const adapterPorts = { vue3: 13715, react: 13716, svelte: 13717 }
const url = `http://localhost:${adapterPorts[adapter]}`

const adapters = ['react', 'svelte', 'vue3']

if (!adapters.includes(adapter)) {
  throw new Error(`Invalid adapter package "${adapter}". Expected one of: ${adapters.join(', ')}.`)
}

// Always define both projects, but can be overridden via BROWSER env var
const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
]

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// Build commands
const buildCommand = `pnpm -r --filter './packages/${adapter}/test-app' build`
const buildSSRCommand = `pnpm -r --filter './packages/${adapter}/test-app' build:ssr`
const serveCommand = `cd tests/app && PACKAGE=${adapter} pnpm serve`

// Web server configuration based on SSR mode
const webServerConfig = ssrEnabled
  ? [
      {
        command: `${buildCommand} && ${buildSSRCommand} && node packages/${adapter}/test-app/dist/ssr.js`,
        url: 'http://localhost:13714/health',
        reuseExistingServer: !runsInCI,
      },
      {
        command: serveCommand,
        url,
        reuseExistingServer: !runsInCI,
      },
    ]
  : {
      command: `${buildCommand} && ${serveCommand}`,
      url,
      reuseExistingServer: !runsInCI,
    }

export default defineConfig({
  testDir: './tests',
  /* Only run SSR tests when SSR=true, otherwise exclude them */
  ...(ssrEnabled ? { testMatch: 'ssr.spec.ts' } : { testIgnore: 'ssr.spec.ts' }),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!runsInCI,
  /* Retry on CI only */
  retries: runsInCI ? 2 : 0,
  /* The GitHub Action runner has 4 cores on Ubuntu and 3 cores on macOS, we need one core for the server */
  workers: runsInCI ? (runsOnMac ? 2 : 3) : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //   reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: url,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Collect screenshots on failure */
    screenshot: 'only-on-failure',
  },

  timeout: 5 * 1000,

  /* Configure projects for major browsers */
  projects,

  /* Run your local dev server before starting the tests */
  webServer: webServerConfig,
})
