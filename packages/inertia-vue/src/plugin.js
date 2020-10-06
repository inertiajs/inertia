import link from './link'
import remember from './remember'
import { Inertia } from '@inertiajs/inertia'

export default {
  instance: null,
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$inertia', { get: () => Inertia })
    Object.defineProperty(Vue.prototype, '$page', { get: () => this.instance.page })
    Vue.mixin(remember)
    Vue.component('InertiaLink', link)
  },
}
