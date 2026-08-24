import { router } from '@inertiajs/core'
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from 'react'
import { useLayerId } from './useLayer'

export default function useRemember<State>(
  initialState: State,
  key?: string,
  excludeKeysRef?: MutableRefObject<string[]>,
): [State, Dispatch<SetStateAction<State>>] {
  const layerId = useLayerId()
  const [state, setState] = useState(() => {
    const restored = router.restore(key, layerId) as State

    return restored !== undefined ? restored : initialState
  })

  useEffect(() => {
    const keys = excludeKeysRef?.current
    if (keys && keys.length > 0 && typeof state === 'object' && state !== null) {
      const filtered = { ...state } as Record<string, unknown>
      keys.forEach((k) => delete filtered[k])
      router.remember(filtered, key, layerId)
    } else {
      router.remember(state, key, layerId)
    }
  }, [state, key])

  return [state, setState]
}
