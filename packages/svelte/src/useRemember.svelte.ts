import { router } from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import { layerId as currentLayerId } from './page.svelte'

export default function useRemember<State extends object>(initialState: State, key?: string): State {
  const layerId = currentLayerId()
  const restored = router.restore(key, layerId) as State | undefined
  const state = $state(restored !== undefined ? cloneDeep(restored) : initialState)

  $effect(() => {
    router.remember(cloneDeep($state.snapshot(state)), key, layerId)
  })

  return state
}
