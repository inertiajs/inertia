import { createLayoutPropsStore, mergeLayoutProps } from '@inertiajs/core'
import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'

const store = createLayoutPropsStore()

export function setLayoutProps(props: Record<string, unknown>): void {
  store.set(props)
}

export function setLayoutPropsFor(name: string, props: Record<string, unknown>): void {
  store.setFor(name, props)
}

export function resetLayoutProps(): void {
  store.reset()
}

export const LayoutPropsContext = createContext<{ staticProps: Record<string, unknown>; name?: string }>({
  staticProps: {},
})

export function useLayoutProps<T extends Record<string, unknown>>(defaults: T): T {
  const { staticProps, name } = useContext(LayoutPropsContext)
  const { shared, named } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)

  return useMemo(() => {
    const dynamicProps = name ? { ...shared, ...named[name] } : shared
    return mergeLayoutProps(defaults, staticProps, dynamicProps)
  }, [defaults, staticProps, name, shared, named])
}
