import { router } from '@inertiajs/core'
import { cloneDeep } from 'lodash-es'
import { ComponentOptions } from 'vue'

type RememberedData = Record<string, any>
type RememberConfig = {
  data: string[]
  key?: string | (() => string)
}

const remember: ComponentOptions = {
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

    const rememberConfig = this.$options.remember as RememberConfig

    const rememberKey = rememberConfig.key instanceof Function ? rememberConfig.key.call(this) : rememberConfig.key

    const restored = router.restore(rememberKey) as RememberedData | undefined

    const rememberable = rememberConfig.data.filter((key: string) => {
      return !(this[key] !== null && typeof this[key] === 'object' && this[key].__rememberable === false)
    })

    const hasCallbacks = (key: string): boolean => {
      return (
        this[key] !== null &&
        typeof this[key] === 'object' &&
        typeof this[key].__remember === 'function' &&
        typeof this[key].__restore === 'function'
      )
    }

    rememberable.forEach((key: string) => {
      if (this[key] !== undefined && restored !== undefined && restored[key] !== undefined) {
        hasCallbacks(key) ? this[key].__restore(restored[key]) : (this[key] = restored[key])
      }

      this.$watch(
        key,
        () => {
          router.remember(
            rememberable.reduce(
              (data: RememberedData, key: string) => ({
                ...data,
                [key]: cloneDeep(hasCallbacks(key) ? this[key].__remember() : this[key]),
              }),
              {},
            ),
            rememberKey,
          )
        },
        { immediate: true, deep: true },
      )
    })
  },
}

export default remember
