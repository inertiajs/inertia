<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { getCurrentInstance, onMounted, ref } from 'vue'

const layoutId = ref<number | null>(null)
const flashCount = ref(0)

window._inertia_flash_events = window._inertia_flash_events || []

onMounted(() => {
  window._inertia_flash_layout_id = getCurrentInstance()?.uid
  layoutId.value = window._inertia_flash_layout_id ?? null
  flashCount.value = window._inertia_flash_events.length
})

router.on('flash', (event) => {
  window._inertia_flash_events.push(event.detail.flash)
  flashCount.value = window._inertia_flash_events.length
})
</script>

<template>
  <div>
    <span class="layout-id">{{ layoutId }}</span>
    <span class="flash-count">{{ flashCount }}</span>
    <slot />
  </div>
</template>
