import plugin from './plugin'
import { Inertia } from '@inertiajs/inertia'

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
  data() {
    return {
      component: null,
      page: {},
      key: null,
    }
  },
  created() {
    plugin.instance = this
    Inertia.init({
      initialPage: this.initialPage,
      resolveComponent: this.resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        this.component = component
        this.page = page
        this.key = preserveState ? this.key : Date.now()
      },
      transformProps: this.transformProps,
    })
  },
  render(h) {
    if (this.component) {
      const child = h(this.component, {
        key: this.key,
        props: this.page.props,
        scopedSlots: this.$scopedSlots,
      })

      if (this.component.layout) {
        if (typeof this.component.layout === 'function') {
          return this.component.layout(h, child)
        } else if (Array.isArray(this.component.layout)) {
          return this.component.layout
            .concat(child)
            .reverse()
            .reduce((child, layout) => h(layout, [child]))
        }

        return h(this.component.layout, [child])
      }

      return child
    }
  },
  install(Vue) {
    plugin.install(Vue)
  },
}
