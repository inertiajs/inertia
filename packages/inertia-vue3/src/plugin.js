import Link from './link'
import Remember from './remember'
import { Inertia } from '@inertiajs/inertia'

export default {
  instance: null,
  install(app) {
    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => this.instance.page })
    app.mixin(Remember)
    app.component('InertiaLink', Link)
  },
}
