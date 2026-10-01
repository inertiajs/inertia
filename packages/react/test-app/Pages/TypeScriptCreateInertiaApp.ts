// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { InertiaAppSSRResponse, Page } from '@inertiajs/core'
import { type ResolvedComponent, createInertiaApp } from '@inertiajs/react'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

// createInertiaApp setup should include shared props without explicit generic
createInertiaApp({
  resolve: (name, page) => {
    console.log(page?.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(page?.props.auth.user?.email)

    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ props }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)
  },
})

// SSR should accept a custom root ID and retain the SSR response type.
export const renderPage = (page: Page): Promise<InertiaAppSSRResponse> =>
  createInertiaApp({
    id: 'custom-root',
    page,
    render: renderToString,
    resolve: () => () => null,
    setup: ({ App, props }) => createElement(App, props),
  })
