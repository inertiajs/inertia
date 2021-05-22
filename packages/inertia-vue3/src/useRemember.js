import cloneDeep from 'lodash.clonedeep'
import { Inertia } from '@inertiajs/inertia'
import { isReactive, reactive, ref, watch } from 'vue'

export default function useRemember(data, key) {
  if (typeof data === 'object' && data !== null && data.__rememberable === false) {
    return data
  }

  const restored = Inertia.restore(key)
  const type = isReactive(data) ? reactive : ref
  const hasCallbacks = typeof data.__remember === 'function' && typeof data.__restore === 'function'
  const remembered = restored === undefined ? data : type(hasCallbacks ? data.__restore(restored) : restored)

  watch(remembered, (newValue) => {
    Inertia.remember(cloneDeep(hasCallbacks ? data.__remember() : newValue), key)
  }, { immediate: true, deep: true })

  return remembered
}
