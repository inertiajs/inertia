import type { Page, Router } from '@inertiajs/core'

declare global {
  interface Window {
    testing: {
      Inertia: Router
    }
    initialPage: Page
  }

  interface ImportMeta {
    glob: <T>(pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<T>>
  }
}

export {}
