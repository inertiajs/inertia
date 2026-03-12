// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { createInertiaApp } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, h } from 'vue'

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
    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)

    createApp({ render: () => h(App, props) }).use(plugin).mount(el)
  },
})
