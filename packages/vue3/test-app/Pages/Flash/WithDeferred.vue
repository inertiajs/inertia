<script setup lang="ts">
import { Deferred, router, usePage } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{
  data?: string
}>()

const page = usePage()
const flashEventCount = ref(0)

router.on('flash', () => {
  flashEventCount.value++
})
</script>

<template>
  <div>
    <span id="flash">{{ JSON.stringify(page.flash) }}</span>
    <span id="flash-event-count">{{ flashEventCount }}</span>

    <Deferred data="data">
      <template #fallback>
        <div id="loading">Loading...</div>
      </template>
      <div id="data">{{ data }}</div>
    </Deferred>
  </div>
</template>
