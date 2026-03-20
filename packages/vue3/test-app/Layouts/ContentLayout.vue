<script setup lang="ts">
import { getCurrentInstance, onMounted } from 'vue'

onMounted(() => {
  window._inertia_content_layout_id = String(getCurrentInstance()?.uid)
})

const props = withDefaults(
  defineProps<{
    padding?: string
    maxWidth?: string
  }>(),
  {
    padding: 'md',
    maxWidth: 'lg',
  },
)
</script>

<template>
  <div class="content-layout" :data-padding="props.padding" :data-max-width="props.maxWidth">
    <div class="content-wrapper">
      <slot />
    </div>
  </div>
</template>
