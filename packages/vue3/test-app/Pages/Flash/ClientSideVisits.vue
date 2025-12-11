<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'

declare global {
  interface Window {
    flashCount: number
  }
}

window.flashCount ??= 0

const page = usePage()

const withFlash = () => {
  router.replace({
    flash: { foo: 'bar' },
    onFlash: () => window.flashCount++,
  })
}

const withFlashFunction = () => {
  router.replace({
    flash: (flash) => ({ ...flash, bar: 'baz' }),
    onFlash: () => window.flashCount++,
  })
}

const withoutFlash = () => {
  router.replace({
    props: (props) => ({ ...props }),
    onFlash: () => window.flashCount++,
  })
}
</script>

<template>
  <div>
    <span id="flash">{{ JSON.stringify(page.flash) }}</span>

    <button @click="withFlash">With flash object</button>
    <button @click="withFlashFunction">With flash function</button>
    <button @click="withoutFlash">Without flash</button>
  </div>
</template>
