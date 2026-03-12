// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'

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
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)

    new App({ target: el!, props })
  },
})
