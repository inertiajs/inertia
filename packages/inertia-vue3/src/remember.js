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

    const rememberable = this.$options.remember.data.filter(key => {
      return !(typeof this[key] === 'object' && this[key] !== null && this[key].__rememberable === false)
    })

    rememberable.forEach(key => {
      if (this[key] !== undefined && restored !== undefined && restored[key] !== undefined) {
        this[key] = restored[key]
      }

      this.$watch(key, () => {
        Inertia.remember(
          rememberable.reduce((data, key) => ({
            ...data,
            [key]: toRaw(unref(this[key])),
          }), {}),
          stateKey,
        )
      }, { immediate: true, deep: true })
    })
  },
}

export function useRemember(data, key) {
  const restored = Inertia.restore(key)
  const remembered = restored === undefined ? data : ref(restored)
  watch(remembered, (value) => Inertia.remember(toRaw(unref(value)), key), { immediate: true, deep: true })

  return remembered
}
