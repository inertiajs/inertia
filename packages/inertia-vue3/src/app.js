import useForm from './useForm'
import remember from './remember'
import { computed, h, markRaw, ref } from 'vue'
import { createHeadManager, Inertia } from '@inertiajs/inertia'

const component = ref(null)
const page = ref({})
const key = ref(null)
let headManager = null

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    initialComponent: {
      type: Object,
      required: false,
    },
    resolveComponent: {
      type: Function,
      required: false,
    },
    titleCallback: {
      type: Function,
      required: false,
      default: title => title,
    },
    onHeadUpdate: {
      type: Function,
      required: false,
      default: () => () => {},
    },
  },
  setup({ initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate }) {
    component.value = initialComponent ? markRaw(initialComponent) : null
    page.value = initialPage
    key.value = null

    const isServer = typeof window === 'undefined'
    headManager = createHeadManager(isServer, titleCallback, onHeadUpdate)

    if (!isServer) {
      Inertia.init({
        initialPage,
        resolveComponent,
        swapComponent: async (args) => {
          component.value = markRaw(args.component)
          page.value = args.page
          key.value = args.preserveState ? key.value : Date.now()
        },
      })
    }

    return () => {
      if (component.value) {
        component.value.inheritAttrs = !!component.value.inheritAttrs

        const child = h(component.value, {
          ...page.value.props,
          key: key.value,
        })

        if (component.value.layout) {
          if (typeof component.value.layout === 'function') {
            return component.value.layout(h, child)
          }

          return (Array.isArray(component.value.layout) ? component.value.layout : [component.value.layout])
            .concat(child)
            .reverse()
            .reduce((child, layout) => {
              layout.inheritAttrs = !!layout.inheritAttrs
              return h(layout, { ...page.value.props }, () => child)
            })
        }

        return child
      }
    }
  },
}

export const plugin = {
  install(app) {
    Inertia.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    app.mixin(remember)
  },
}

export function usePage() {
  return {
    props: computed(() => page.value.props),
    url: computed(() => page.value.url),
    component: computed(() => page.value.component),
    version: computed(() => page.value.version),
  }
}
