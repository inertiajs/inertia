import { onBeforeUnmount, watch, isRef, isReactive } from 'vue'
import { headManager } from './app'

export default function useHead(schema: any): void {
  const provider = headManager.createProvider()

  if (isRef(schema) || isReactive(schema) || typeof schema === 'function') {
    watch(
      () => (typeof schema === 'function' ? schema() : schema),
      (newSchema) => provider.update(newSchema),
      { immediate: true, deep: true },
    )
  } else {
    provider.update(schema)
  }

  onBeforeUnmount(() => {
    provider.disconnect()
  })
}
