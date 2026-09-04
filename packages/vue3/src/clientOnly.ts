import { canRenderClientOnly } from '@inertiajs/core'
import { defineComponent, Fragment, h, onMounted, ref, type SlotsType } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  slots: Object as SlotsType<{
    default: {}
    fallback: {}
  }>,
  setup(_, { slots }) {
    // `ClientOnly` renders the fallback slot on its first render if and only if that
    // render is part of an SSR hydration pass for the current document. In every other
    // case -- a pure client-rendered boot, and every instance created after the initial
    // hydration commit (including after ordinary page remounts) -- it renders the
    // default slot on its very first render. Local per-instance state can't express
    // this: a remount creates a new instance that restarts at "not mounted", so the
    // "have we passed hydration" signal has to live outside any single component
    // instance (see `@inertiajs/core`'s `hydrationBoot`).
    const mounted = ref(canRenderClientOnly())

    onMounted(() => {
      mounted.value = true
    })

    return () => {
      if (!mounted.value) {
        return h(Fragment, { key: 'fallback' }, slots.fallback?.({}) ?? [])
      }

      return h(Fragment, { key: 'default' }, slots.default?.({}) ?? [])
    }
  },
})
