import { createLayoutPropsStore, type LayoutSlot } from '@inertiajs/core'
import { ref } from 'vue'

const store = createLayoutPropsStore()

export const state = ref(store.get())

export const layerState = ref(new Map<string, LayoutSlot>())

store.subscribe(() => {
  state.value = store.get()
  layerState.value = new Map(store.layerIds().map((id) => [id, store.getForLayer(id)]))
})

export const setLayoutProps = store.set

export function resetLayoutProps(): void {
  store.reset()
  state.value = store.get()
}

export function retainLayerLayoutProps(ids: string[]): void {
  store.retainLayers(ids)
}
