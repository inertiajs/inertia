import { defineComponent, Fragment, h, onMounted, ref, type SlotsType } from 'vue'
import { injectHydrationContext } from './hydration'

export default defineComponent({
  name: 'WhenMounted',
  slots: Object as SlotsType<{
    default: {}
    fallback: {}
  }>,
  setup(_, { slots }) {
    // The injected ref is false only during the initial hydration render, so the fallback shows
    // there and the default slot shows everywhere else, remounts included
    const hydrated = injectHydrationContext()
    const mounted = ref(hydrated?.value ?? false)

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
