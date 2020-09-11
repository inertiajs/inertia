import { Inertia } from '@inertiajs/inertia'
import Link from './link'
import Remember from './remember'

let app = {}

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
    layout: {}
  },
  data() {
    return {
      component: null,
      props: {},
      key: null,
    }
  },
  created() {
    app = this
    Inertia.init({
      initialPage: this.initialPage,
      resolveComponent: this.resolveComponent,
      updatePage: async (component, props, { preserveState }) => {
        this.component = component
        this.props = this.transformProps(props)
        this.key = preserveState ? this.key : Date.now()
      },
    })
  },
  render(h) {
    if (this.component) {
      const child = h(this.component, {
        key: this.key,
        props: this.props,
        scopedSlots: this.$scopedSlots,
      })

      let layout = this.layout;

      if (typeof this.component.layout !== 'undefined') {
        layout = this.component.layout
      }

      if (layout) {
        if (typeof layout === 'function') {
          return layout(h, child)
        } else if (Array.isArray(layout)) {
          return layout
            .concat(child)
            .reverse()
            .reduce((child, layout) => h(layout, [child]))
        }

        return h(layout, [child])
      }

      return child
    }
  },
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$inertia', { get: () => Inertia })
    Object.defineProperty(Vue.prototype, '$page', { get: () => app.props })
    Vue.mixin(Remember)
    Vue.component('InertiaLink', Link)
  },
}
