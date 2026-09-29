import { cloneDeep } from 'es-toolkit'
import { useLayer } from './page.svelte'

export default function useRemember<State extends object>(initialState: State, key?: string): State {
  const layer = useLayer()
  const restored = layer.restore(key) as State | undefined
  const state = $state(restored !== undefined ? cloneDeep(restored) : initialState)

  $effect(() => {
    layer.remember(cloneDeep($state.snapshot(state)), key)
  })

  return state
}
