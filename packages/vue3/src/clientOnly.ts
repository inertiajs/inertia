import { defineComponent, Fragment, h, onMounted, ref, type SlotsType } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  slots: Object as SlotsType<{
    default: {}
    fallback: {}
  }>,
  setup(_, { slots }) {
    // Not a `typeof window` check: the client's first render must match the server's
    // HTML, so the swap has to wait for mount.
    const mounted = ref(false)

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
