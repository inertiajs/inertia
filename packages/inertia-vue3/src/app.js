import link from './link'
import remember from './remember'
import { h, markRaw, reactive } from 'vue'
import { Inertia } from '@inertiajs/inertia'

const current = reactive({
  component: null,
  page: {},
  key: null,
});

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
    transformProps: {
      type: Function,
      default: props => props,
    },
  },
  setup({ initialPage, resolveComponent, transformProps }) {
    Inertia.init({
      initialPage,
      resolveComponent,
      transformProps,
      swapComponent: async ({ component, page, preserveState }) => {
        current.component = markRaw(component)
        current.page = page
        current.key = preserveState ? current.key : Date.now()
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
  }
}

export const InertiaPlugin = {
  install(app) {
    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => current.page })
    app.mixin(remember)
    app.component('InertiaLink', link)
  },
}
