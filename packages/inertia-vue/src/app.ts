import Vue, { ComponentOptions, CreateElement, VNode } from 'vue'
import { defineComponent, ref, computed, markRaw, provide, h, PropType, Ref } from '@vue/composition-api'
import { Inertia, Page, PageProps, PageResolver, VisitOptions, createHeadManager, HeadManager, HeadManagerTitleCallback, HeadManagerOnUpdate } from '@inertiajs/inertia'
import { useForm } from './form'
import { remember } from './remember'
import { HeadManagerKey } from './head'

export type LayoutComponent = ComponentOptions<Vue> | ComponentOptions<Vue>[] | LayoutFunction
export type LayoutFunction = (h: CreateElement, child: VNode) => ComponentOptions<Vue> | ComponentOptions<Vue>[]

let headManager: HeadManager

const component = ref(null) as Ref<ComponentOptions<Vue> | null>
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
      type: [Object, Function, String] as PropType<ComponentOptions<Vue>>,
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
      default: () => () => {},
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
          component.value = markRaw(args.component as ComponentOptions<Vue>)
          page.value = args.page
          key.value = args.preserveState ? key.value : Date.now()
        },
        visitOptions,
      })

      Inertia.on('navigate', () => headManager.forceUpdate())
    }

    provide(HeadManagerKey, headManager)

    return () => {
      if (component.value) {
        component.value.inheritAttrs = !!component.value.inheritAttrs

        const child = h(component.value, {
          key: key.value,
          props: page.value.props,
        })

        if (component.value.layout) {
          if (typeof component.value.layout === 'function') {
            return component.value.layout(h, child)
          }

          return (Array.isArray(component.value.layout) ? component.value.layout : [component.value.layout])
            .reverse()
            .reduce((child, layout) => {
              layout.inheritAttrs = !!layout.inheritAttrs
              return h(layout, { props: page.value.props }, [child])
            }, child)
        }

        return child
      }
    }
  },
})

export const plugin: Vue.PluginObject<Vue> = {
  install(Vue) {
    Inertia.form = useForm

    Vue.mixin({
      beforeCreate() {
        Object.defineProperty(this, '$inertia', {
          get: function () { return Inertia },
        })
        Object.defineProperty(this, '$page', {
          get: function () { return page.value },
        })
        Object.defineProperty(this, '$headManager', {
          get: function () { return headManager },
        })
      },
    })
  
    Vue.mixin(remember)
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
