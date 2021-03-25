import { isReactive, reactive, ref, toRaw, unref, watch } from 'vue'
import { Inertia } from '@inertiajs/inertia'

export default function useRemember(data, key) {
  if (typeof data === 'object' && data !== null && data.__rememberable === false) {
    return data
  }

  const restored = Inertia.restore(key)
  const remembered = restored === undefined ? data : (isReactive(data) ? reactive(data) : ref(restored))
  watch(remembered, (value) => Inertia.remember(toRaw(unref(value)), key), { immediate: true, deep: true })

  return remembered
}
