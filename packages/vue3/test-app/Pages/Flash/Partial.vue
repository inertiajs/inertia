<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{
  count: number
}>()

const page = usePage()
const flashEventCount = ref(0)

router.on('flash', () => {
  flashEventCount.value++
})

const reloadWithSameFlash = () => {
  router.reload({ only: ['count'], data: { flashType: 'same', count: Date.now() } })
}

const reloadWithDifferentFlash = () => {
  router.reload({ only: ['count'], data: { flashType: 'different', count: Date.now() } })
}
</script>

<template>
  <div>
    <span id="flash">{{ JSON.stringify(page.flash) }}</span>
    <span id="flash-event-count">{{ flashEventCount }}</span>
    <span id="count">{{ count }}</span>

    <button @click="reloadWithSameFlash">Reload with same flash</button>
    <button @click="reloadWithDifferentFlash">Reload with different flash</button>
  </div>
</template>
