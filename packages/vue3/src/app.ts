import {
  createHeadManager,
  HeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  isPropsObjectOrCallback,
  isPropsObject,
  normalizeLayouts,
  Page,
  PageProps,
  router,
  SharedPageProps,
} from '@inertiajs/core'
import {
  Component,
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
import { state as layoutPropsState, resetLayoutProps } from './layoutProps'
import remember from './remember'
import { VuePageHandlerArgs } from './types'
import useForm from './useForm'

type LayoutComponent = DefineComponent | Component

function isComponent(value: unknown): value is LayoutComponent {
  if (!value) {
    return false
  }

  if (typeof value === 'function') {
    return true
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return (
      typeof obj.render === 'function' ||
      typeof obj.setup === 'function' ||
      typeof obj.template === 'string' ||
      '__file' in obj ||
      '__name' in obj
    )
  }

  return false
}

function isRenderFunction(value: unknown): boolean {
  if (typeof value !== 'function') {
    return false
  }

  const fn = value as Function
  return fn.length === 2 && typeof fn.prototype === 'undefined'
}

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  initialPage: Page<SharedProps>
  initialComponent?: DefineComponent
  resolveComponent?: (name: string, page?: Page) => DefineComponent | Promise<DefineComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
  defaultLayout?: (name: string, page: Page) => unknown
}

export type InertiaApp = DefineComponent<InertiaAppProps>

const component = ref<DefineComponent | undefined>(undefined)
const page = ref<Page>()
let pageAccessor: Page | null = null
const layout = shallowRef(null)
const key = ref<number | undefined>(undefined)
export let headManager: HeadManager

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
      type: Function as PropType<(name: string, page?: Page) => DefineComponent | Promise<DefineComponent>>,
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
    defaultLayout: {
      type: Function as PropType<(name: string, page: Page) => unknown>,
      required: false,
    },
  },
  setup({
    initialPage,
    initialComponent,
    resolveComponent,
    titleCallback,
    onHeadUpdate,
    defaultLayout,
  }: InertiaAppProps) {
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
          if (!options.preserveState) {
            resetLayoutProps()
          }

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

        if (component.value.layout && isRenderFunction(component.value.layout)) {
          return (component.value.layout as Function)(h, child)
        }

        let effectiveLayout: unknown
        let callbackProps: Record<string, unknown> | null = null
        const layoutValue = component.value.layout

        if (
          typeof layoutValue === 'function' &&
          (layoutValue as Function).length <= 1 &&
          typeof (layoutValue as Function).prototype === 'undefined'
        ) {
          const result = (layoutValue as Function)(page.value!.props)

          if (isPropsObjectOrCallback(result, isComponent)) {
            effectiveLayout = defaultLayout?.(page.value!.component, page.value!)
            callbackProps = result as Record<string, unknown>
          } else {
            effectiveLayout = result
          }
        } else if (isPropsObject(layoutValue, isComponent)) {
          effectiveLayout = defaultLayout?.(page.value!.component, page.value!)
          callbackProps = layoutValue as Record<string, unknown>
        } else {
          effectiveLayout = layoutValue ?? defaultLayout?.(page.value!.component, page.value!)
        }

        if (effectiveLayout) {
          let layouts = normalizeLayouts(
            effectiveLayout,
            isComponent,
            component.value.layout && !callbackProps ? isRenderFunction : undefined,
          )

          if (callbackProps) {
            layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }))
          }

          if (layouts.length > 0) {
            const dynamicProps = isServer ? { shared: {}, named: {} } : layoutPropsState.value

            return layouts.reduceRight((childNode, layout) => {
              const layoutComponent = layout.component as DefineComponent
              layoutComponent.inheritAttrs = !!layoutComponent.inheritAttrs

              return h(
                layoutComponent,
                {
                  ...page.value!.props,
                  ...layout.props,
                  ...dynamicProps.shared,
                  ...(layout.name ? dynamicProps.named[layout.name] || {} : {}),
                },
                () => childNode,
              )
            }, child)
          }
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
  if (!pageAccessor) {
    pageAccessor = reactive({
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
      scrollProps: computed(() => page.value?.scrollProps),
      flash: computed(() => page.value?.flash),
    }) as Page
  }

  return pageAccessor as Page<TPageProps>
}
