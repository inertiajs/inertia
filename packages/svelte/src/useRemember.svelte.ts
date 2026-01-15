import { router } from '@inertiajs/core'
import { cloneDeep } from 'lodash-es'

export default function useRemember<State extends object>(initialState: State, key?: string): State {
  const restored = router.restore(key) as State | undefined
  const state = $state(restored !== undefined ? cloneDeep(restored) : initialState)

  $effect(() => {
    router.remember(cloneDeep($state.snapshot(state)), key)
  })

  return state
}
