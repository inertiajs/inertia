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
      updatePage: (component, props, { preserveState }) => {
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
      })

      if (this.component.layout) {
        if (typeof this.component.layout === 'function') {
          return this.component.layout(h, child)
        }

        return this.resolveLayout(h, this.component.layout, child);
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
  methods: {
    resolveLayout(h, layout, child) {
        child = h(layout, [child]);
        layout = layout.layout;

        return layout ? this.resolveLayout(h, layout, child) : child;
    }
  },
}
