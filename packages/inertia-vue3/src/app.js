import form from './form'
import link from './link'
import remember from './remember'
import { computed, h, markRaw, reactive } from 'vue'
import { Inertia } from '@inertiajs/inertia'

const current = reactive({
  component: null,
  page: {},
  key: null,
})

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    resolveComponent: {
      type: Function,
      required: true,
    },
    resolveErrors: {
      type: Function,
      required: false,
    },
    transformProps: {
      type: Function,
      required: false,
    },
  },
  setup({ initialPage, resolveComponent, transformProps, resolveErrors }) {
    Inertia.init({
      initialPage,
      resolveComponent,
      resolveErrors,
      transformProps,
      swapComponent: async (args) => {
        current.component = markRaw(args.component)
        current.page = args.page
        current.key = args.preserveState ? current.key : Date.now()
      },
    })

    return () => {
      if (current.component) {
        const child = h(current.component, {
          ...current.page.props,
          key: current.key,
        })

        if (current.component.layout) {
          if (typeof current.component.layout === 'function') {
            return current.component.layout(h, child)
          } else if (Array.isArray(current.component.layout)) {
            return current.component.layout
              .concat(child)
              .reverse()
              .reduce((child, layout) => h(layout, [child]))
          }

          return h(current.component.layout, () => child)
        }

        return child
      }
    }
  },
}

export const plugin = {
  install(app) {
    Inertia.form = form
    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => current.page })
    app.mixin(remember)
    app.component('InertiaLink', link)
  },
}

export function usePage() {
  return {
    props: computed(() => current.page.props),
    url: computed(() => current.page.url),
    component: computed(() => current.page.component),
    version: computed(() => current.page.version),
  }
}
