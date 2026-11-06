<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  file: { url: string; pages: number }
}>()

const layoutEffectCount = ref(0)

watch(
  () => props.file,
  () => {
    layoutEffectCount.value++
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <p id="layout-effect-count">Layout effect count: {{ layoutEffectCount }}</p>
    <slot />
  </div>
</template>
