<script setup lang="ts">
import { router } from '@inertiajs/core'
import { defineProps, onMounted, ref } from 'vue'

const props = defineProps<{
  data: string | string[]
  buffer?: number
}>()

const only = typeof props.data === 'string' ? [props.data] : props.data
const whenVisible = ref<HTMLElement | null>(null)
const loaded = ref(false)
const buffer = props.buffer || 0

onMounted(() => {
  if (!whenVisible.value) {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect()
        router.reload({
          only: only,
          onFinish: () => {
            loaded.value = true
          },
        })
      }
    },
    {
      rootMargin: `${buffer}px`,
    },
  )

  observer.observe(whenVisible.value)
})
</script>

<template>
  <div ref="whenVisible" />
  <slot name="loading" v-if="!loaded" />
  <slot v-if="loaded" />
</template>
