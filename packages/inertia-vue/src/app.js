import form from './form'
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
      type: [Object, Function, String],
      required: false,
    },
    resolveComponent: {
      type: Function,
      required: false,
    },
    titleCallback: {
      type: Function,
      required: false,
      default: title => title,
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
    headManager = createHeadManager(this.$isServer, this.titleCallback, this.onHeadUpdate)

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
}

export const plugin = {
  install(Vue) {
    Inertia.form = form
    Vue.mixin(remember)

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
