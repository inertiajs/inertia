import { router } from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import { inject, isReactive, reactive, ref, Ref, watch } from 'vue'
import { layerIdKey } from './useLayer'

export default function useRemember<T extends object>(
  data: T & { __rememberable?: boolean; __remember?: Function; __restore?: Function },
  key?: string,
): Ref<T> | T {
  if (typeof data === 'object' && data !== null && data.__rememberable === false) {
    return data
  }

  const layerId = inject(layerIdKey, undefined)
  const restored = router.restore(key, layerId)
  const type = isReactive(data) ? reactive : ref
  const hasCallbacks = typeof data.__remember === 'function' && typeof data.__restore === 'function'
  const remembered = type(
    restored === undefined ? data : hasCallbacks ? data.__restore!(cloneDeep(restored)) : cloneDeep(restored),
  )

  watch(
    remembered,
    (newValue) => {
      router.remember(cloneDeep(hasCallbacks ? data.__remember!() : newValue), key, layerId)
    },
    { immediate: true, deep: true },
  )

  return remembered
}
