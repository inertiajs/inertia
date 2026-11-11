import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { onDestroy, onMount } from 'svelte'
import { getHydrationContext } from './hydration'
import { layerId as currentLayerId, usePage } from './page.svelte'

export interface InertiaProp<T> {
  readonly value: T | undefined
  readonly loading: boolean
  readonly loaded: boolean
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  const page = usePage()
  const layerId = currentLayerId()

  // The server renders nothing as loading, so hydration has to match it before
  // the client catches up on mount
  const isHydrating = getHydrationContext()?.hydrated === false

  let loading = $state(isHydrating ? false : propRefreshes.isRefreshing(name, layerId))

  const value = $derived(get(page.props, name) as T | undefined)

  const sync = () => {
    loading = propRefreshes.isRefreshing(name, layerId)
  }

  if (typeof window !== 'undefined') {
    onDestroy(propRefreshes.onChange(sync))
  }

  if (isHydrating) {
    onMount(sync)
  }

  return {
    get value() {
      return value
    },
    get loading() {
      return loading
    },
    get loaded() {
      return value !== undefined
    },
  }
}
