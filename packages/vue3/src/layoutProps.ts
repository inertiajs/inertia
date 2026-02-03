import { createLayoutPropsStore, mergeLayoutProps } from '@inertiajs/core'
import { computed, ComputedRef, ref, useAttrs } from 'vue'

const store = createLayoutPropsStore()
const state = ref(store.getSnapshot())

store.subscribe(() => {
  state.value = store.getSnapshot()
})

export function setLayoutProps(props: Record<string, unknown>): void {
  store.set(props)
}

export function setLayoutPropsFor(name: string, props: Record<string, unknown>): void {
  store.setFor(name, props)
}

export function resetLayoutProps(): void {
  store.reset()
}

export function resolveLayoutProps(name?: string): Record<string, unknown> {
  const { shared, named } = state.value
  return name ? { ...shared, ...named[name] } : shared
}

export function useLayoutProps<T extends Record<string, unknown>>(defaults: T): ComputedRef<T> {
  const attrs = useAttrs()
  const name = attrs.__layoutName as string | undefined

  return computed(() => {
    const { shared, named } = state.value
    const dynamicProps = name ? { ...shared, ...named[name] } : shared
    return mergeLayoutProps(defaults, attrs as Record<string, unknown>, dynamicProps)
  })
}
