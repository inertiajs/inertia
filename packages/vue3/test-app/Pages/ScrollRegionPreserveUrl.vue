<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const props = defineProps<{
  page: number
}>()

// The scroll position the container jumps to before the continuous scrolling starts, so the
// preserved position never depends on how many interval ticks the browser managed to run.
const scrollBaseline = 100

let scrollInterval: ReturnType<typeof setInterval> | null = null

const startScrollingAndNavigate = () => {
  const container = document.getElementById('scroll-container')!
  const nextPage = props.page === 1 ? 2 : 1

  container.scrollTop = scrollBaseline

  // Keep scrolling while the visit is in flight
  scrollInterval = setInterval(() => {
    container.scrollTop += 10
  }, 10)

  setTimeout(() => {
    router.visit(`/scroll-region-preserve-url/${nextPage}`, {
      preserveScroll: true,
      preserveState: true,
      preserveUrl: true,
      onSuccess: () => {
        if (scrollInterval) {
          clearInterval(scrollInterval)
          scrollInterval = null
        }
      },
    })
  }, 150)
}
</script>

<template>
  <div scroll-region id="scroll-container" style="height: 300px; overflow-y: auto; border: 1px solid #ccc">
    <div style="padding: 10px">
      <div class="page-number">Page: {{ page }}</div>
      <div id="scroll-baseline">Scroll baseline: {{ scrollBaseline }}</div>
      <button id="scroll-and-navigate" @click="startScrollingAndNavigate">Start scrolling and navigate</button>
      <div v-for="i in 50" :key="i" style="padding: 20px; border-bottom: 1px solid #eee">Item {{ i }}</div>
    </div>
  </div>
</template>
