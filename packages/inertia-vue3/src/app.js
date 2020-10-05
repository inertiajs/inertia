import Link from './link'
import Remember from './remember'
import { h, markRaw } from 'vue'
import { Inertia } from '@inertiajs/inertia'

let instance = {}

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
    instance = this
    Inertia.init({
      initialPage: this.initialPage,
      resolveComponent: this.resolveComponent,
      updatePage: async (component, page, { preserveState }) => {
        this.component = markRaw(component)
        page.props = this.transformProps(page.props)
        Object.assign(this.page, page)
        this.key = preserveState ? this.key : Date.now()
      },
    })
  },
  render() {
    if (this.component) {
      const child = h(this.component, {
        ...this.page.props,
        key: this.key,
        slots: this.$slots,
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

        return h(this.component.layout, () => child)
      }

      return child
    }
  },
}

export const InertiaPlugin = {
  install(app) {
    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => instance.page })
    app.mixin(Remember)
    app.component('InertiaLink', Link)
  },
}
