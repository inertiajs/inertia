import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { onDestroy, onMount } from 'svelte'
import page from './page.svelte'

export interface InertiaProp<T> {
  readonly value: T | undefined
  readonly loading: boolean
  readonly loaded: boolean
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  let loading = $state(false)

  const value = $derived(get(page.props, name) as T | undefined)

  let unsubscribe: (() => void) | null = null

  const sync = () => {
    loading = propRefreshes.isRefreshing(name)
  }

  onMount(() => {
    sync()

    unsubscribe = propRefreshes.onChange(sync)
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  })

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
