<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  id: number
  url: string
}>()

const loaded = ref(false)
</script>

<template>
  <div class="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
    <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-gray-300" aria-hidden="true" />

    <img
      :src="url"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition duration-500 ease-out"
      :class="{
        'blur-0 scale-100 opacity-100': loaded,
        'scale-105 opacity-0 blur-sm': !loaded,
      }"
      @load="loaded = true"
    />

    <span class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
      {{ id }}
    </span>
  </div>
</template>
