import { useEffect, useState } from 'react'
import { router } from '@inertiajs/core'

export default function useRemember(initialState, key) {
  const [state, setState] = useState(() => {
    const restored = router.restore(key)

    return restored !== undefined ? restored : initialState
  })

  useEffect(() => {
    router.remember(state, key)
  }, [state, key])

  return [state, setState]
}

export function useRememberedState(initialState, key) {
  console.warn(
    'The "useRememberedState" hook has been deprecated and will be removed in a future release. Use "useRemember" instead.',
  )
  return useRemember(initialState, key)
}
