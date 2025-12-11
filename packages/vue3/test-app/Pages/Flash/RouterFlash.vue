<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'

const page = usePage()

const setFlash = () => {
  router.flash({ foo: 'bar' })
}

const setFlashKeyValue = () => {
  router.flash('foo', 'bar')
}

const mergeFlash = () => {
  router.flash((current) => ({ ...current, bar: 'baz' }))
}

const clearFlash = () => {
  router.flash(() => ({}))
}
</script>

<template>
  <div>
    <span id="flash">{{ page.flash ? JSON.stringify(page.flash) : 'no-flash' }}</span>

    <button @click="setFlash">Set flash</button>
    <button @click="setFlashKeyValue">Set flash key-value</button>
    <button @click="mergeFlash">Merge flash</button>
    <button @click="clearFlash">Clear flash</button>
  </div>
</template>
