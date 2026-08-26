import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { onDestroy } from 'svelte'
import page from './page.svelte'

export interface InertiaProp<T> {
  readonly value: T | undefined
  readonly loading: boolean
  readonly loaded: boolean
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  let loading = $state(propRefreshes.isRefreshing(name))

  const value = $derived(get(page.props, name) as T | undefined)

  const sync = () => {
    loading = propRefreshes.isRefreshing(name)
  }

  if (typeof window !== 'undefined') {
    onDestroy(propRefreshes.onChange(sync))
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
