import { propRefreshes } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { computed, onMounted, onScopeDispose, ref, type ComputedRef, type Ref } from 'vue'
import { usePage } from './app'
import { injectHydrationContext } from './hydration'

export interface InertiaProp<T> {
  value: ComputedRef<T | undefined>
  loading: Readonly<Ref<boolean>>
  loaded: ComputedRef<boolean>
}

export default function useProp<T = unknown>(name: string): InertiaProp<T> {
  const page = usePage()

  const value = computed(() => get(page.props, name) as T | undefined)
  const loaded = computed(() => value.value !== undefined)

  // The server renders nothing as loading, so hydration has to match it before
  // the client catches up on mount
  const isHydrating = injectHydrationContext()?.value === false
  const loading = ref(isHydrating ? false : propRefreshes.isRefreshing(name))

  const sync = () => {
    loading.value = propRefreshes.isRefreshing(name)
  }

  // Nothing subscribes on the server: `onScopeDispose` never runs there, so an
  // eager subscribe would leak a listener into core on every render
  if (typeof window !== 'undefined') {
    onScopeDispose(propRefreshes.onChange(sync))
  }

  if (isHydrating) {
    onMounted(sync)
  }

  return { value, loaded, loading }
}
