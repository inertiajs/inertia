import { createLayoutPropsStore } from '@inertiajs/core'

export const store = createLayoutPropsStore()

export const setLayoutProps = store.set

export function resetLayoutProps(): void {
  store.reset()
}

export function retainLayerLayoutProps(ids: string[]): void {
  store.retainLayers(ids)
}
