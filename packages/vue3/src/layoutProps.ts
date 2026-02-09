import { createLayoutPropsStore, mergeLayoutProps } from '@inertiajs/core'
import { computed, ComputedRef, defineComponent, inject, InjectionKey, provide, ref, useAttrs } from 'vue'

const store = createLayoutPropsStore()
const state = ref(store.get())

store.subscribe(() => {
  state.value = store.get()
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

export const LAYOUT_CONTEXT_KEY: InjectionKey<string | undefined> = Symbol('inertia-layout')

export const LayoutProvider = defineComponent({
  inheritAttrs: false,
  props: {
    layoutName: String,
  },
  setup(props, { slots }) {
    provide(LAYOUT_CONTEXT_KEY, props.layoutName)

    return () => slots.default?.()
  },
})

export function useLayoutProps<T extends Record<string, unknown>>(defaults: T): ComputedRef<T> {
  const attrs = useAttrs()
  const name = inject(LAYOUT_CONTEXT_KEY, undefined)

  return computed(() => {
    const { shared, named } = state.value
    const dynamicProps = name ? { ...shared, ...named[name] } : shared
    return mergeLayoutProps(defaults, attrs as Record<string, unknown>, dynamicProps)
  })
}
