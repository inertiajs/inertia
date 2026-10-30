import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { onDestroy, onMount } from 'svelte'
import { getHydrationContext } from './hydration'
import page from './page.svelte'

export interface InertiaProp<T> {
  readonly value: T | undefined
  readonly loading: boolean
  readonly loaded: boolean
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  // The server renders nothing as loading, so hydration has to match it before
  // the client catches up on mount
  const isHydrating = getHydrationContext()?.hydrated === false

  let loading = $state(isHydrating ? false : propRefreshes.isRefreshing(name))

  const value = $derived(get(page.props, name) as T | undefined)

  const sync = () => {
    loading = propRefreshes.isRefreshing(name)
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
