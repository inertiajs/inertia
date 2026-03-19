import { isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { defineComponent, onMounted, onUnmounted, ref, type SlotsType } from 'vue'
import { usePage } from './app'

const keysAreBeingReloaded = (only: string[], except: string[], keys: string[]): boolean => {
  if (only.length === 0 && except.length === 0) {
    return true
  }

  if (only.length > 0) {
    return keys.some((key) => only.includes(key))
  }

  return keys.some((key) => !except.includes(key))
}

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
          keysAreBeingReloaded(visit.only, visit.except, keys)
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

      if (!slots.fallback) {
        throw new Error('`<Deferred>` requires a `<template #fallback>` slot')
      }

      return keys.every((key) => get(page.props, key) !== undefined)
        ? slots.default?.({ reloading: reloading.value })
        : slots.fallback({})
    }
  },
})
