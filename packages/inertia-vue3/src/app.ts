import { defineComponent, computed, h, h as createElement, markRaw, ref, Component, DefineComponent, PropType, Ref, VNode, Plugin } from 'vue'
import { Inertia, Page, PageProps, PageResolver, VisitOptions, createHeadManager, HeadManager, HeadManagerTitleCallback, HeadManagerOnUpdate } from '@inertiajs/inertia'
import { useForm } from './form'
import { remember } from './remember'

export type LayoutComponent = Component | Component[] | LayoutFunction
export type LayoutFunction = (h: typeof createElement, child: VNode) => VNode

let headManager: HeadManager

const component = ref(null) as Ref<DefineComponent<any, any, any> | null>
const page = ref({}) as Ref<Page>
const key = ref<number | string | undefined>(undefined)

export const App = defineComponent({
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object as PropType<Page>,
      required: true,
    },
    initialComponent: {
      type: [Object, Function, String] as PropType<DefineComponent<any, any, any>>,
      required: false,
    },
    resolveComponent: {
      type: Function as PropType<PageResolver>,
      required: true,
    },
    titleCallback: {
      type: Function as PropType<HeadManagerTitleCallback>,
      required: false,
      default: (title => title) as HeadManagerTitleCallback,
    },
    onHeadUpdate: {
      type: Function as PropType<HeadManagerOnUpdate>,
      required: false,
      default: () => {},
    },
    visitOptions: {
      type: Function as PropType<VisitOptions>,
      required: false,
      default: () => {},
    },
  },
  setup({ initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate, visitOptions }) {
    component.value = initialComponent ? markRaw(initialComponent) : null
    page.value = initialPage
    key.value = undefined

    const isServer = typeof window === 'undefined'
    headManager = createHeadManager(isServer, titleCallback, onHeadUpdate)

    if (!isServer) {
      Inertia.init({
        initialPage,
        resolveComponent,
        swapComponent: async (args) => {
          component.value = markRaw(args.component as DefineComponent<any, any, any>)
          page.value = args.page
          key.value = args.preserveState ? key.value : Date.now()
        },
        visitOptions,
      })

      Inertia.on('navigate', () => headManager.forceUpdate())
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
            return (component.value.layout as LayoutFunction)(h, child)
          }

          return (Array.isArray(component.value.layout) ? component.value.layout : [component.value.layout] as unknown[])
            .concat(child)
            .reverse()
            .reduce((child, layout) => {
              (layout as DefineComponent).inheritAttrs = !!(layout as DefineComponent).inheritAttrs
              return h(layout as DefineComponent, { ...page.value.props }, () => child as VNode)
            })
        }

        return child
      }
    }
  },
})

export const plugin: Plugin = {
  install(app) {
    Inertia.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    app.mixin(remember)
  },
}

export function usePage<Props>() {
  return {
    props: computed(() => (page as Ref<Page<Props & PageProps>>).value.props),
    url: computed(() => page.value.url),
    component: computed(() => page.value.component),
    version: computed(() => page.value.version),
    scrollRegions: computed(() => page.value.scrollRegions),
    rememberedState: computed(() => page.value.rememberedState),
    resolvedErrors: computed(() => page.value.resolvedErrors),
  }
}
