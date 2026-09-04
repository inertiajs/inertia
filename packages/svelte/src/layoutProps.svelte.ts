import { createLayoutPropsStore, type LayoutSlot } from '@inertiajs/core'

const store = createLayoutPropsStore()

export const storeState = $state({
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
})

export const layerState = $state<Record<string, LayoutSlot>>({})

store.subscribe(() => {
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named

  const known = new Set(store.layerIds())
  for (const id of known) {
    layerState[id] = store.getForLayer(id)
  }
  for (const id of Object.keys(layerState)) {
    if (!known.has(id)) {
      delete layerState[id]
    }
  }
})

export const setLayoutProps = store.set

export function resetLayoutProps(): void {
  store.reset()
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
}

export function retainLayerLayoutProps(ids: string[]): void {
  store.retainLayers(ids)
}
