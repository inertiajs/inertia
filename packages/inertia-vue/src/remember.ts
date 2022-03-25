import { defineComponent, isReactive, reactive, ref, watch, Ref } from '@vue/composition-api'
import { Inertia } from '@inertiajs/inertia'
import cloneDeep from 'lodash.clonedeep'

export const remember = defineComponent({
  created() {
    if (!this.$options.remember || typeof window === 'undefined') {
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

    const restored = Inertia.restore(rememberKey) as Record<string, any> | undefined

    const rememberable = this.$options.remember.data.filter((key: string) => {
      const currentData = this[key] as null | Record<string, any>
      return !(
        currentData !== null &&
        typeof currentData === 'object' &&
        currentData.__rememberable === false
      )
    })

    const hasCallbacks = (key: string) => {
      const currentData = this[key] as null | Record<string, any>
      return currentData !== null
        && typeof currentData === 'object'
        && typeof currentData.__remember === 'function'
        && typeof currentData.__restore === 'function'
    }

    rememberable.forEach((key: string) => {
      const currentData = this[key] as undefined | Record<string, any>

      if (currentData !== undefined && restored !== undefined && restored[key] !== undefined) {
        hasCallbacks(key)
          ? currentData.__restore(restored[key])
          : (this[key] = restored[key])
      }

      this.$watch(key, () => {
        Inertia.remember(
          rememberable.reduce((data, key) => ({
            ...data,
            [key]: cloneDeep(hasCallbacks(key) ? currentData?.__remember(): currentData),
          }), {} as Record<string, any>),
          rememberKey,
        )
      }, { immediate: true, deep: true })
    })
  },
})

export type UseRememberReturn<T, RefType extends 'reactive' | 'ref'> =
  RefType extends 'reactive' ? T :
  RefType extends 'ref' ? Ref<T> : never

export function useRemember<
  T extends Record<string, any>,
  RefType extends 'reactive' | 'ref' = 'ref',
>(data: T, key: string): UseRememberReturn<T, RefType> {
  if (typeof data === 'object' && data !== null && data.__rememberable === false) {
    return data as UseRememberReturn<T, RefType>
  }

  const restored = Inertia.restore(key) as T | undefined
  const refType = isReactive(data) ? reactive : ref
  const hasCallbacks = typeof data.__remember === 'function' && typeof data.__restore === 'function'
  const remembered = restored === undefined
    ? data
    : refType(hasCallbacks ? data.__restore(restored) : restored)

  watch(remembered, (newValue) => {
    Inertia.remember(cloneDeep(hasCallbacks ? data.__remember() : newValue), key)
  }, { immediate: true, deep: true })

  return remembered as UseRememberReturn<T, RefType>
}
