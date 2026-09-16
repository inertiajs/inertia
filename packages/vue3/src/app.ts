import {
  createHeadManager,
  emptyLayoutSlot,
  HeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  layoutProps,
  LayoutSlot,
  LoadingResolver,
  Page,
  PageProps,
  ResolvedLayer,
  resolveLayouts,
  resolveServerHead,
  router,
  SharedPageProps,
  topPageOf,
  type ServerHeadOption,
} from '@inertiajs/core'
import {
  Component,
  computed,
  DefineComponent,
  defineComponent,
  h,
  hasInjectionContext,
  InjectionKey,
  inject,
  markRaw,
  onUnmounted,
  Plugin,
  PropType,
  provide,
  reactive,
  ref,
  Ref,
  shallowRef,
  toRef,
} from 'vue'
import Layer from './Layer'
import { layerState as layerPropsForLayers, state as layoutPropsState, swapLayoutProps } from './layoutProps'
import remember from './remember'
import { VuePageHandlerArgs } from './types'
import useForm from './useForm'
import { layerIdKey } from './useLayer'

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
  initialLayers?: ResolvedLayer<DefineComponent>[]
  resolveComponent?: (name: string, page?: Page) => DefineComponent | Promise<DefineComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
  defaultLayout?: (name: string, page: Page) => unknown
  layer?: Component
  resolveLoading?: LoadingResolver
  serverHead?: ServerHeadOption
}

export type InertiaApp = DefineComponent<InertiaAppProps>

const component = ref<DefineComponent | undefined>(undefined)
const page = ref<Page>()
const layers = shallowRef<ResolvedLayer<DefineComponent>[] | undefined>(undefined)
let pageAccessorRef: Page | null = null
const layerAccessors = new WeakMap<Ref<Page>, Page>()
const layout = shallowRef(null)
const key = ref<number | undefined>(undefined)
export let headManager: HeadManager

const layerPageKey: InjectionKey<Ref<Page>> = Symbol('inertiaLayerPage')

const LayerPageProvider = defineComponent({
  name: 'LayerPageProvider',
  props: {
    page: { type: Object as PropType<Page>, required: true },
    layerId: { type: String, required: true },
  },
  setup(props, { slots }) {
    provide(layerPageKey, toRef(props, 'page'))
    provide(layerIdKey, props.layerId)

    return () => slots.default?.()
  },
})

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
    initialLayers: {
      type: Array as PropType<ResolvedLayer<DefineComponent>[]>,
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
    layer: {
      type: [Object, Function] as PropType<Component>,
      required: false,
    },
    resolveLoading: {
      type: Function as PropType<LoadingResolver>,
      required: false,
    },
    serverHead: {
      type: [Boolean, String, Function] as PropType<ServerHeadOption>,
      required: false,
    },
  },
  setup({
    initialPage,
    initialComponent,
    initialLayers,
    resolveComponent,
    titleCallback,
    onHeadUpdate,
    defaultLayout,
    layer: LayerShell = Layer,
    resolveLoading,
    serverHead,
  }: InertiaAppProps) {
    component.value = initialComponent ? markRaw(initialComponent) : undefined
    page.value = { ...initialPage, flash: initialPage.flash ?? {} }
    layers.value = initialLayers?.map((layer) => ({ ...layer, component: markRaw(layer.component) }))
    key.value = undefined

    const isServer = typeof window === 'undefined'

    headManager = createHeadManager(
      isServer,
      (title: string) => (titleCallback ? titleCallback(title, topPageOf(page.value!)) : title),
      onHeadUpdate || (() => {}),
      resolveServerHead(initialPage, serverHead),
      () => page.value?.layers ?? [],
    )

    if (!isServer) {
      router.init<DefineComponent>({
        initialPage,
        resolveComponent: resolveComponent!,
        resolveLoading,
        swapComponent: async (options: VuePageHandlerArgs) => {
          swapLayoutProps(options)

          component.value = options.component ? markRaw(options.component) : undefined
          page.value = options.page
          layers.value = options.layers?.map((layer) => ({ ...layer, component: markRaw(layer.component) }))
          key.value = options.preserveState ? key.value : Date.now()
        },
        onFlash: (flash) => {
          page.value = { ...page.value!, flash }
        },
      })

      const syncServerHead = (event: { detail: { page: Page } }) => {
        headManager.updateServerHead(resolveServerHead(event.detail.page, serverHead))
      }

      const removeNavigateListener = router.on('navigate', syncServerHead)
      const removeClientVisitListener = router.on('clientVisit', syncServerHead)

      onUnmounted(() => {
        removeNavigateListener()
        removeClientVisitListener()
      })
    }

    const baseLayoutProps = () => (isServer ? emptyLayoutSlot : layoutPropsState.value)
    const layerLayoutProps = (layerId: string) =>
      isServer ? emptyLayoutSlot : (layerPropsForLayers.value.get(layerId) ?? emptyLayoutSlot)

    const wrapInLayout = (
      component: DefineComponent,
      page: Page,
      child: ReturnType<typeof h>,
      dynamicProps: () => LayoutSlot,
    ): ReturnType<typeof h> => {
      if (component.layout && isRenderFunction(component.layout)) {
        return (component.layout as Function)(h, child)
      }

      const layouts = resolveLayouts(component.layout, page, defaultLayout, { isComponent, isRenderFunction })

      if (!Array.isArray(layouts) || layouts.length === 0) {
        return child
      }

      const slot = dynamicProps()

      return layouts.reduceRight((childNode, layout) => {
        const layoutComponent = layout.component as DefineComponent
        layoutComponent.inheritAttrs = !!layoutComponent.inheritAttrs

        return h(layoutComponent, layoutProps(layout, page, slot), () => childNode)
      }, child)
    }

    const renderTier = (component: DefineComponent, props: PageProps, key: number | undefined) => {
      component.inheritAttrs = !!component.inheritAttrs

      return h(component, { ...props, key })
    }

    const renderBase = () => {
      if (!component.value) {
        return
      }

      const child = renderTier(component.value, page.value!.props, key.value)

      if (layout.value) {
        component.value.layout = layout.value
        layout.value = null
      }

      return wrapInLayout(component.value, page.value!, child, baseLayoutProps)
    }

    // Always a fragment, even with an empty stack: a root that flips between a single vnode and
    // a fragment fails isSameVNodeType, and the page beneath would remount when the first layer opens.
    return () => {
      const stack = layers.value ?? []

      return [
        renderBase(),
        ...stack.map((layer) => {
          const content = () =>
            wrapInLayout(
              layer.component,
              layer.layoutPage,
              renderTier(layer.component, layer.page.props, layer.renderKey),
              () => layerLayoutProps(layer.id),
            )

          return h(LayerPageProvider, { key: layer.id, page: layer.page, layerId: layer.id }, () =>
            h(LayerShell, layer.shell, () =>
              h('div', { ...layer.attributes, style: { viewTransitionName: layer.transitionName } }, content()),
            ),
          )
        }),
      ]
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

const pageKeys = [
  'props',
  'url',
  'component',
  'version',
  'clearHistory',
  'deferredProps',
  'rescuedProps',
  'mergeProps',
  'prependProps',
  'deepMergeProps',
  'matchPropsOn',
  'rememberedState',
  'encryptHistory',
  'scrollProps',
  'flash',
  'layers',
] as const

const pageAccessor = (source: () => Page | undefined): Page =>
  reactive(Object.fromEntries(pageKeys.map((key) => [key, computed(() => source()?.[key])]))) as unknown as Page

export function usePage<TPageProps extends PageProps = PageProps>(): Page<TPageProps & SharedPageProps> {
  const layerPage = hasInjectionContext() ? inject<Ref<Page> | undefined>(layerPageKey, undefined) : undefined

  if (layerPage) {
    let layerAccessor = layerAccessors.get(layerPage)

    if (!layerAccessor) {
      layerAccessor = pageAccessor(() => layerPage.value)
      layerAccessors.set(layerPage, layerAccessor)
    }

    return layerAccessor as Page<TPageProps>
  }

  pageAccessorRef ??= pageAccessor(() => page.value)

  return pageAccessorRef as Page<TPageProps>
}
