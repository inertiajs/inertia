import { router } from '@inertiajs/core'

export default function useRemember<State extends object>(initialState: State, key?: string): State {
  const restored = router.restore(key) as State | undefined
  const state = $state(restored !== undefined ? restored : initialState)

  $effect(() => {
    router.remember($state.snapshot(state), key)
  })

  return state
}
