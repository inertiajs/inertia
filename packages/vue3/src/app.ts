import {
  createHeadManager,
  HeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  Page,
  PageProps,
  router,
  SharedPageProps,
} from '@inertiajs/core'
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

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  initialPage: Page<SharedProps>
  initialComponent?: DefineComponent
  resolveComponent?: (name: string) => DefineComponent | Promise<DefineComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
}

export type InertiaApp = DefineComponent<InertiaAppProps>

const component = ref<DefineComponent | undefined>(undefined)
const page = ref<Page>()
const layout = shallowRef(null)
const key = ref<number | undefined>(undefined)
let headManager: HeadManager

const App: InertiaApp = defineComponent({
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object as PropType<Page>,
      required: true,
    },
    initialComponent: {
      type: Object as PropType<DefineComponent>,
      required: false,
    },
    resolveComponent: {
      type: Function as PropType<(name: string) => DefineComponent | Promise<DefineComponent>>,
      required: false,
    },
    titleCallback: {
      type: Function as PropType<HeadManagerTitleCallback>,
      required: false,
      default: (title: string) => title,
    },
    onHeadUpdate: {
      type: Function as PropType<HeadManagerOnUpdateCallback>,
      required: false,
      default: () => () => {},
    },
  },
  setup({ initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate }: InertiaAppProps) {
    component.value = initialComponent ? markRaw(initialComponent) : undefined
    page.value = { ...initialPage, flash: initialPage.flash ?? {} }
    key.value = undefined

    const isServer = typeof window === 'undefined'
    headManager = createHeadManager(isServer, titleCallback || ((title: string) => title), onHeadUpdate || (() => {}))

    if (!isServer) {
      router.init<DefineComponent>({
        initialPage,
        resolveComponent: resolveComponent!,
        swapComponent: async (options: VuePageHandlerArgs) => {
          component.value = markRaw(options.component)
          page.value = options.page
          key.value = options.preserveState ? key.value : Date.now()
        },
        onFlash: (flash) => {
          page.value = { ...page.value!, flash }
        },
      })

      router.on('navigate', () => headManager.forceUpdate())
    }

    return () => {
      if (component.value) {
        component.value.inheritAttrs = !!component.value.inheritAttrs

        const child = h(component.value, {
          ...page.value!.props,
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
              return h(layout, { ...page.value!.props }, () => child)
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
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    app.mixin(remember)
  },
}

export function usePage<TPageProps extends PageProps = PageProps>(): Page<TPageProps & SharedPageProps> {
  return reactive({
    props: computed(() => page.value?.props),
    url: computed(() => page.value?.url),
    component: computed(() => page.value?.component),
    version: computed(() => page.value?.version),
    clearHistory: computed(() => page.value?.clearHistory),
    deferredProps: computed(() => page.value?.deferredProps),
    mergeProps: computed(() => page.value?.mergeProps),
    prependProps: computed(() => page.value?.prependProps),
    deepMergeProps: computed(() => page.value?.deepMergeProps),
    matchPropsOn: computed(() => page.value?.matchPropsOn),
    rememberedState: computed(() => page.value?.rememberedState),
    encryptHistory: computed(() => page.value?.encryptHistory),
    flash: computed(() => page.value?.flash),
  }) as Page<TPageProps>
}
