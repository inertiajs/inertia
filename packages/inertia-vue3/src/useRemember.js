import { isReactive, reactive, ref, watch } from 'vue'
import { Inertia } from '@inertiajs/inertia'
import cloneDeep from 'lodash.clonedeep'

export default function useRemember(data, key) {
  if (typeof data === 'object' && data !== null && data.__rememberable === false) {
    return data
  }

  const restored = Inertia.restore(key)
  const remembered = restored === undefined ? data : (isReactive(data) ? reactive(restored) : ref(restored))
  watch(remembered, (value) => Inertia.remember(cloneDeep(value), key), { immediate: true, deep: true })

  return remembered
}
