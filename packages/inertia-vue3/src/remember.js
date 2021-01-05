import { ref, toRaw, unref, watch } from 'vue'
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
          this.$options.remember.data.reduce((data, key) => ({
            ...data,
            [key]: typeof this[key].serialize === 'function' && typeof this[key].unserialize === 'function'
              ? this[key].serialize()
              : toRaw(this[key]),
          }), {}),
          stateKey,
        )
      }, { immediate: true, deep: true })
    })
  },
}

export function useRemember(data, key) {
  data = toRaw(unref(data))
  const restored = Inertia.restore(key)

  const remembered = restored === undefined ? ref(data) : ref(
    typeof data.serialize === 'function' && typeof data.unserialize === 'function'
      ? data.unserialize(restored)
      : restored,
  )

  watch(remembered, (remembered) => {
    Inertia.remember(
      typeof data.serialize === 'function' && typeof data.unserialize === 'function'
        ? data.serialize()
        : toRaw(remembered),
      key,
    )
  }, { immediate: true, deep: true })

  return remembered
}
