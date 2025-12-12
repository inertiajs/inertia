<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { router, usePage } from '@inertiajs/vue3'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    flashDataType: {
      toast?: { type: 'success' | 'error'; message: string }
    }
  }
}

const page = usePage()

// page.flash is always an object
const flash = page.flash
const toast = page.flash.toast
const toastMessage = page.flash.toast?.message
const toastType = page.flash.toast?.type

// @ts-expect-error - 'message' does not exist on flash (it's on toast)
const flashMessage = page.flash.message

// router.flash with object
router.flash({ toast: { type: 'success', message: 'Hello' } })

// router.flash with key-value
router.flash('toast', { type: 'error', message: 'Oops' })

// router.flash with callback
router.flash((current) => ({
  ...current,
  toast: { type: 'success', message: 'Updated' },
}))

// Client-side visit with flash
router.replace({
  flash: { toast: { type: 'success', message: 'Replaced' } },
  onFlash: (flash) => {
    console.log(flash.toast?.message)
  },
})

// Client-side visit with flash callback
router.push({
  flash: (current) => ({
    ...current,
    toast: { type: 'error', message: 'Error' },
  }),
})

console.log({
  flash,
  toast,
  toastMessage,
  toastType,
  flashMessage,
})
</script>

<template>
  <div v-if="page.flash.toast">
    {{ page.flash.toast.message }}
  </div>

  <!-- @vue-expect-error - 'message' does not exist on flash -->
  {{ page.flash.message }}
</template>
