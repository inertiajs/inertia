import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { computed, onScopeDispose, ref, type ComputedRef, type Ref } from 'vue'
import { usePage } from './app'

export interface InertiaProp<T> {
  value: ComputedRef<T | undefined>
  loading: Readonly<Ref<boolean>>
  loaded: ComputedRef<boolean>
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  const page = usePage()

  const value = computed(() => get(page.props, name) as T | undefined)
  const loaded = computed(() => value.value !== undefined)
  const loading = ref(propRefreshes.isRefreshing(name))

  const sync = () => {
    loading.value = propRefreshes.isRefreshing(name)
  }

  // Nothing subscribes on the server: `onScopeDispose` never runs there, so an
  // eager subscribe would leak a listener into core on every render
  if (typeof window !== 'undefined') {
    onScopeDispose(propRefreshes.onChange(sync))
  }

  return { value, loaded, loading }
}
