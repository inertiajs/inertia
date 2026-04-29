import { anyPathIsReloaded, isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { defineComponent, onMounted, onUnmounted, ref, type SlotsType } from 'vue'
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
    error: {}
  }>,
  setup(props, { slots }) {
    const reloading = ref(false)
    const activeReloads = new Set<object>()
    const page = usePage()

    let removeStartListener: (() => void) | null = null
    let removeFinishListener: (() => void) | null = null

    onMounted(() => {
      const keys = (Array.isArray(props.data) ? props.data : [props.data]) as string[]

      removeStartListener = router.on('start', (e) => {
        const visit = e.detail.visit

        if (
          visit.preserveState === true &&
          isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
          anyPathIsReloaded(keys, visit.only, visit.except)
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
      const keys = (Array.isArray(props.data) ? props.data : [props.data]) as string[]
      const rescuedKeys = new Set(page.rescuedProps || [])

      if (!slots.fallback) {
        throw new Error('`<Deferred>` requires a `<template #fallback>` slot')
      }

      const propsAreDefined = keys.every((key) => get(page.props, key) !== undefined)
      const propsAreSettled = keys.every((key) => get(page.props, key) !== undefined || rescuedKeys.has(key))
      const hasRescuedProps = keys.some((key) => rescuedKeys.has(key))

      return propsAreDefined && !hasRescuedProps
        ? slots.default?.({ reloading: reloading.value })
        : propsAreSettled && hasRescuedProps && slots.error
          ? slots.error({})
        : slots.fallback({})
    }
  },
})
