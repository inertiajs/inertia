// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { type ResolvedComponent, createInertiaApp } from '@inertiajs/react'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

// createInertiaApp setup should include shared props without explicit generic
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ props }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)
  },
})
