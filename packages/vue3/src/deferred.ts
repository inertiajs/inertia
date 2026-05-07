import { isSameUrlWithoutQueryOrHash, partialReloadRequestsSomeProps, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, ref, type SlotsType } from 'vue'
import { usePage } from './app'

export default defineComponent({
  name: 'Deferred',
  props: {
    data: {
      type: [String, Array<String>],
      required: true,
    },
  },
  slots: Object as SlotsType<{
    default: { reloading: boolean }
    fallback: {}
    rescue: { reloading: boolean }
  }>,
  setup(props, { slots }) {
    const reloading = ref(false)
    const activeReloads = new Set<object>()
    const page = usePage()
    const keys = computed(() => (Array.isArray(props.data) ? props.data : [props.data]) as string[])
    const rescuedKeys = computed(() => new Set(page.rescuedProps))

    let removeStartListener: (() => void) | null = null
    let removeFinishListener: (() => void) | null = null

    onMounted(() => {
      removeStartListener = router.on('start', (e) => {
        const visit = e.detail.visit

        if (
          visit.preserveState === true &&
          isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
          partialReloadRequestsSomeProps(visit, keys.value)
        ) {
          activeReloads.add(visit)
          reloading.value = true
        }
      })

      removeFinishListener = router.on('finish', (e) => {
        const visit = e.detail.visit

        if (activeReloads.has(visit)) {
          activeReloads.delete(visit)
          reloading.value = activeReloads.size > 0
        }
      })
    })

    onUnmounted(() => {
      removeStartListener?.()
      removeFinishListener?.()
      activeReloads.clear()
    })

    return () => {
      if (!slots.fallback) {
        throw new Error('`<Deferred>` requires a `<template #fallback>` slot')
      }

      const propsAreDefined = keys.value.every((key) => get(page.props, key) !== undefined)
      const hasRescuedProps = keys.value.some((key) => rescuedKeys.value.has(key))
      const slotProps = { reloading: reloading.value }

      if (propsAreDefined && !hasRescuedProps) {
        return h(Fragment, { key: 'default' }, slots.default?.(slotProps) ?? [])
      }

      if (hasRescuedProps && slots.rescue) {
        return h(Fragment, { key: 'rescue' }, slots.rescue(slotProps))
      }

      return h(Fragment, { key: 'fallback' }, slots.fallback({}))
    }
  },
})
