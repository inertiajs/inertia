import link from './link'
import remember from './remember'
import { Inertia } from '@inertiajs/inertia'

export default {
  instance: null,
  install(app) {
    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => this.instance.page })
    app.mixin(remember)
    app.component('InertiaLink', link)
  },
}
