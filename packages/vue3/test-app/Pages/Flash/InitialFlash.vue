<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'
import { ref } from 'vue'

const page = usePage()
const flashEvents = ref<any[]>([])

router.on('flash', (e) => {
  flashEvents.value.push(e.detail.flash)
})
</script>

<template>
  <div>
    <span id="flash">{{ page.flash ? JSON.stringify(page.flash) : 'no-flash' }}</span>
    <span id="flash-events">{{ JSON.stringify(flashEvents) }}</span>
  </div>
</template>
