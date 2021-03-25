import { ref, toRaw, unref, watch } from 'vue'
import { Inertia } from '@inertiajs/inertia'

export default function useRemember(data, key) {
  const restored = Inertia.restore(key)
  const remembered = restored === undefined ? data : ref(restored)
  watch(remembered, (value) => Inertia.remember(toRaw(unref(value)), key), { immediate: true, deep: true })

  return remembered
}
