import form from './form'
import head from './head'
import link from './link'
import remember from './remember'
import { createHeadManager, Inertia } from '@inertiajs/inertia'

let app = {}
let headManager = null

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    initialComponent: {
      type: Object,
      required: false,
    },
    resolveComponent: {
      type: Function,
      required: false,
    },
    onHeadUpdate: {
      type: Function,
      required: false,
      default: () => () => {},
    },
  },
  data() {
    return {
      component: this.initialComponent || null,
      page: this.initialPage,
      key: null,
    }
  },
  created() {
    app = this
    headManager = createHeadManager(this.$isServer, this.onHeadUpdate)

    if (!this.$isServer) {
      Inertia.init({
        initialPage: this.initialPage,
        resolveComponent: this.resolveComponent,
        swapComponent: async ({ component, page, preserveState }) => {
          this.component = component
          this.page = page
          this.key = preserveState ? this.key : Date.now()
        },
      })
    }
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
            .reduce((child, layout) => h(layout, { props: this.$page.props }, [child]))
        }

        return h(this.component.layout, { props: this.page.props }, [child])
      }

      return child
    }
  },
  install(Vue) {
    console.warn('Registering the Inertia Vue plugin via the "app" component has been deprecated. Use the new "plugin" named export instead.\n\nimport { plugin } from \'@inertiajs/inertia-vue\'\n\nVue.use(plugin)')
    plugin.install(Vue)
  },
}

export const plugin = {
  install(Vue) {
    Inertia.form = form
    Vue.mixin(remember)
    Vue.component('InertiaHead', head)
    Vue.component('InertiaLink', link)

    Vue.mixin({
      beforeCreate() {
        Object.defineProperty(this, '$headManager', {
          get: function () { return headManager },
        })
        Object.defineProperty(this, '$inertia', {
          get: function () { return Inertia },
        })
        Object.defineProperty(this, '$page', {
          get: function () { return app.page },
        })
      },
    })
  },
}
