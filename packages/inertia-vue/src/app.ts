import { ComponentOptions, CreateElement, VNode } from 'vue'
import { defineComponent, ref, computed, PropType, Ref } from '@vue/composition-api'
import { Inertia, Page, PageProps, PageResolver, VisitOptions, createHeadManager, HeadManager, HeadManagerTitleCallback, HeadManagerOnUpdate } from '@inertiajs/inertia'
import { useForm } from './form'
import { remember } from './remember'

export type LayoutComponent = ComponentOptions<never> | ComponentOptions<never>[] | LayoutFunction
export type LayoutFunction = (h: CreateElement, child: VNode) => VNode

let headManager: HeadManager

const page = ref({}) as Ref<Page>

export const App = defineComponent({
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object as PropType<Page>,
      required: true,
    },
    initialComponent: {
      type: [Object, Function, String] as PropType<ComponentOptions<never>>,
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
  data() {
    return {
      component: (this.initialComponent || null) as ComponentOptions<never>,
      page: this.initialPage as Page,
      key: undefined as number | undefined,
    }
  },
  watch: {
    page: {
      handler: newPage => page.value = newPage,
      immediate: true,
    },
  },
  created() {
    headManager = createHeadManager(this.$isServer, this.titleCallback, this.onHeadUpdate)

    if (!this.$isServer) {
      Inertia.init({
        initialPage: this.initialPage,
        resolveComponent: this.resolveComponent,
        swapComponent: async ({ component, page, preserveState }) => {
          this.component = component as ComponentOptions<never>
          this.page = page
          this.key = preserveState ? this.key : Date.now()
        },
        visitOptions: this.visitOptions,
      })

      Inertia.on('navigate', () => headManager.forceUpdate())
    }
  },
  render(h) {
    const component = this.component as ComponentOptions<never>
    const page = this.page as Page
    const key = this.key as number | undefined

    if (component) {
      const child = h(component, {
        key,
        props: page.props,
      })

      if (component.layout) {
        if (typeof component.layout === 'function') {
          return component.layout(h, child)
        }

        return (Array.isArray(component.layout) ? component.layout : [component.layout] as unknown[])
          .concat(child)
          .reverse()
          .reduce((child, layout) => {
            return h(layout as ComponentOptions<never>, { props: page.props }, [child as VNode])
          }) as VNode
      }

      return child
    }

    return h('template')
  },
})

export const plugin: Vue.PluginObject<never> = {
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
