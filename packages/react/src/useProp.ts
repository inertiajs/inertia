import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { useSyncExternalStore } from 'react'
import usePage from './usePage'

export interface InertiaProp<T> {
  value: T | undefined
  loading: boolean
  loaded: boolean
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  const page = usePage()

  const loading = useSyncExternalStore(
    propRefreshes.onChange,
    () => propRefreshes.isRefreshing(name),
    () => false,
  )

  const value = get(page.props, name) as T | undefined

  return { value, loading, loaded: value !== undefined }
}
