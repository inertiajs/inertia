import {
  createHeadManager,
  HeadManager,
  HeadManagerOnUpdateCallback,
  HeadOnUpdateCallback,
  Page,
  PageHandler,
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
import { SetupProps } from './createInertiaApp'
import remember from './remember'
import useForm from './useForm'

type LayoutFunction = (h: typeof import('vue').h, page: ReturnType<typeof h>) => ReturnType<typeof h>

type ComponentWithLayout = DefineComponent & {
  layout?: DefineComponent | DefineComponent[] | LayoutFunction
  inheritAttrs?: boolean
}

type VuePageHandler = (options: { component: DefineComponent; page: Page; preserveState: boolean }) => Promise<void>

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  initialPage: Page<SharedProps>
  initialComponent?: object
  resolveComponent?: (name: string) => DefineComponent | Promise<DefineComponent>
  titleCallback?: HeadOnUpdateCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
}

export type InertiaApp = DefineComponent<InertiaAppProps>

const component = ref<ComponentWithLayout | null>(null)
const page = ref<Page>()
const layout = shallowRef<ComponentWithLayout | ComponentWithLayout[] | null>(null)
const key = ref<number | undefined>(undefined)
let headManager: HeadManager

const App = defineComponent({
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
    titleCallback: {
      type: Function as PropType<HeadOnUpdateCallback>,
      required: false,
      default: (title: string) => title,
    },
    onHeadUpdate: {
      type: Function as PropType<HeadManagerOnUpdateCallback>,
      required: false,
      default: () => () => {},
    },
  },
  setup({ initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate }: SetupProps) {
    component.value = initialComponent ? markRaw(initialComponent) : null
    page.value = initialPage
    key.value = undefined

    const isServer = typeof window === 'undefined'
    headManager = createHeadManager(isServer, titleCallback || ((title) => title), onHeadUpdate || (() => {}))

    if (!isServer) {
      router.init({
        initialPage,
        resolveComponent,
        swapComponent: (async (options: Parameters<VuePageHandler>[0]) => {
          component.value = markRaw(options.component)
          page.value = options.page
          key.value = options.preserveState ? key.value : Date.now()
        }) as PageHandler,
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
            const layoutFunc = component.value.layout as LayoutFunction
            return layoutFunc(h, child)
          }

          const layouts = Array.isArray(component.value.layout) ? component.value.layout : [component.value.layout]

          return layouts.reverse().reduce((children, layout) => {
            layout.inheritAttrs = !!layout.inheritAttrs
            return h(layout, { ...page.value!.props }, () => children)
          }, child)
        }

        return child
      }
    }
  },
}) as InertiaApp

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
  }) as Page<TPageProps>
}
