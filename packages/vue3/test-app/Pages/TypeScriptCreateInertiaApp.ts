// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { InertiaAppSSRResponse, Page } from '@inertiajs/core'
import { createInertiaApp } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

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

    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)

    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})

// SSR should accept a custom root ID and retain the SSR response type.
export const renderPage = (page: Page): Promise<InertiaAppSSRResponse> =>
  createInertiaApp({
    id: 'custom-root',
    page,
    render: renderToString,
    resolve: () => defineComponent({ render: () => null }),
    setup: ({ App, props, plugin }) => createSSRApp({ render: () => h(App, props) }).use(plugin),
  })
