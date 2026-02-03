import { isSameUrlWithoutQueryOrHash, router } from '@inertiajs/core'
import { defineComponent, onMounted, onUnmounted, ref, type SlotsType } from 'vue'

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

    return { reloading, slots }
  },
  render() {
    const keys = (Array.isArray(this.$props.data) ? this.$props.data : [this.$props.data]) as string[]

    if (!this.$slots.fallback) {
      throw new Error('`<Deferred>` requires a `<template #fallback>` slot')
    }

    return keys.every((key) => this.$page.props[key] !== undefined)
      ? this.$slots.default?.({ reloading: this.reloading })
      : this.$slots.fallback({})
  },
})
