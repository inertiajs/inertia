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

    const stateKey = this.$options.remember.key instanceof Function
      ? this.$options.remember.key.call(this)
      : this.$options.remember.key

    const restored = Inertia.restore(stateKey)

    this.$options.remember.data.forEach(key => {
      if (this[key] !== undefined && restored !== undefined && restored[key] !== undefined) {
        typeof this[key].serialize === 'function' && typeof this[key].unserialize === 'function'
          ? this[key].unserialize(restored[key])
          : (this[key] = restored[key])
      }

      this.$watch(key, () => {
        Inertia.remember(
          this.$options.remember.data.reduce((carry, key) => ({
            ...carry,
            [key]: typeof this[key].serialize === 'function' && typeof this[key].unserialize === 'function'
              ? this[key].serialize()
              : this[key],
          }), {}),
          stateKey,
        )
      }, { immediate: true, deep: true })
    })
  },
}
