import { Page, PageProps, router } from '@inertiajs/core'
import {
  computed,
  DefineComponent,
  defineComponent,
  h,
  markRaw,
  Plugin,
  PropType,
  reactive,
  ref,
  shallowRef,
} from 'vue'
import remember from './remember'
import { VuePageHandlerArgs } from './types'
import useForm from './useForm'

export interface InertiaAppProps {
  initialPage: Page
  initialComponent?: object
  resolveComponent?: (name: string) => DefineComponent | Promise<DefineComponent>
}

export type InertiaApp = DefineComponent<InertiaAppProps>

const component = ref(null)
const page = ref<Page<any>>(null)
const layout = shallowRef(null)
const key = ref(null)

const App: InertiaApp = defineComponent({
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object as PropType<Page>,
      required: true,
    },
    initialComponent: {
      type: Object,
      required: false,
    },
    resolveComponent: {
      type: Function as PropType<(name: string) => DefineComponent | Promise<DefineComponent>>,
      required: false,
    },
  },
  setup({ initialPage, initialComponent, resolveComponent }) {
    component.value = initialComponent ? markRaw(initialComponent) : null
    page.value = initialPage
    key.value = null

    const isServer = typeof window === 'undefined'

    if (!isServer) {
      router.init({
        initialPage,
        resolveComponent,
        swapComponent: async (args: VuePageHandlerArgs) => {
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

        if (layout.value) {
          component.value.layout = layout.value
          layout.value = null
        }

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
})
export default App

export const plugin: Plugin = {
  install(app) {
    router.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => router })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })

    app.mixin(remember)
  },
}

export function usePage<SharedProps extends PageProps>(): Page<SharedProps> {
  return reactive({
    props: computed(() => page.value?.props),
    url: computed(() => page.value?.url),
    component: computed(() => page.value?.component),
    version: computed(() => page.value?.version),
    scrollRegions: computed(() => page.value?.scrollRegions),
    rememberedState: computed(() => page.value?.rememberedState),
  })
}
