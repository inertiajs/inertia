import type { Page, Router } from '@inertiajs/core'

declare global {
  interface Window {
    testing: {
      Inertia: Router
    }
    initialPage: Page
  }

  interface ImportMeta {
    readonly glob: <T>(pattern: string, options: { eager: true }) => Record<string, T>
  }
}

export {}
