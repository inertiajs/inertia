import { createLayoutPropsStore, mergeLayoutProps } from '@inertiajs/core'
import { getContext } from 'svelte'
import { readable, type Readable } from 'svelte/store'

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

export const LAYOUT_CONTEXT_KEY = Symbol('inertia-layout')

export function useLayoutProps<T extends Record<string, unknown>>(defaults: T): Readable<T> {
  const context = getContext<{ readonly staticProps: Record<string, unknown>; readonly name?: string } | undefined>(LAYOUT_CONTEXT_KEY)

  const resolve = () => {
    const staticProps = context?.staticProps ?? {}
    const name = context?.name
    const { shared, named } = store.get()
    const dynamicProps = name ? { ...shared, ...named[name] } : shared
    return mergeLayoutProps(defaults, staticProps, dynamicProps)
  }

  return readable<T>(resolve(), (set) => store.subscribe(() => set(resolve())))
}
