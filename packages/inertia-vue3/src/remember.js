import cloneDeep from 'lodash.clonedeep'
import { Inertia } from '@inertiajs/inertia'

export default {
  created() {
    if (!this.$options.remember) {
      return
    }

    if (Array.isArray(this.$options.remember)) {
      this.$options.remember = { data: this.$options.remember }
    }

    if (typeof this.$options.remember === 'string') {
      this.$options.remember = { data: [this.$options.remember] }
    }

    if (typeof this.$options.remember.data === 'string') {
      this.$options.remember = { data: [this.$options.remember.data] }
    }

    const rememberKey = this.$options.remember.key instanceof Function
      ? this.$options.remember.key.call(this)
      : this.$options.remember.key

    const restored = Inertia.restore(rememberKey)

    const rememberable = this.$options.remember.data.filter(key => {
      return !(this[key] !== null && typeof this[key] === 'object' && this[key].__rememberable === false)
    })

    const hasCallbacks = (key) => {
      return this[key] !== null
        && typeof this[key] === 'object'
        && typeof this[key].__remember === 'function'
        && typeof this[key].__restore === 'function'
    }

    rememberable.forEach(key => {
      if (this[key] !== undefined && restored !== undefined && restored[key] !== undefined) {
        hasCallbacks(key) ? this[key].__restore(restored[key]) : (this[key] = restored[key])
      }

      this.$watch(key, () => {
        Inertia.remember(
          rememberable.reduce((data, key) => ({
            ...data,
            [key]: cloneDeep(hasCallbacks(key) ? this[key].__remember(): this[key]),
          }), {}),
          rememberKey,
        )
      }, { immediate: true, deep: true })
    })
  },
}
