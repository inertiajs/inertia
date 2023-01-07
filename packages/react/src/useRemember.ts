import { router } from '@inertiajs/core'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export default function useRemember<State>(
  initialState: State,
  key?: string,
): [State, Dispatch<SetStateAction<State>>] {
  const [state, setState] = useState(() => {
    const restored = router.restore(key) as State

    return restored !== undefined ? restored : initialState
  })

  useEffect(() => {
    router.remember(state, key)
  }, [state, key])

  return [state, setState]
}

/** @deprecated use `useRemember` instead */
export function useRememberedState<State>(initialState: State, key?: string): [State, Dispatch<SetStateAction<State>>] {
  console.warn(
    'The "useRememberedState" hook has been deprecated and will be removed in a future release. Use "useRemember" instead.',
  )
  return useRemember(initialState, key)
}
