import { inject, provide, type InjectionKey, type Ref } from 'vue'

const HydrationContextKey: InjectionKey<Ref<boolean>> = Symbol('InertiaHydrationContext')

export function provideHydrationContext(hydrated: Ref<boolean>): void {
  provide(HydrationContextKey, hydrated)
}

export function injectHydrationContext(): Ref<boolean> | null {
  return inject(HydrationContextKey, null)
}
