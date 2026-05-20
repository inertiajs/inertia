<script setup lang="ts">
const props = defineProps<{
  mode: 'stylesheet' | 'inline'
}>()

import { router } from '@inertiajs/vue3'
import { onBeforeUnmount, onMounted } from 'vue'

const invalidVisit = () => {
  router.post('/non-inertia')
}

let styleTag: HTMLStyleElement | null = null

onMounted(() => {
  if (props.mode === 'stylesheet') {
    styleTag = document.createElement('style')
    styleTag.id = 'body-overflow-style'
    styleTag.textContent = 'body { overflow-y: scroll; }'
    document.head.appendChild(styleTag)
  } else {
    document.body.style.overflow = 'hidden'
  }
})

onBeforeUnmount(() => {
  if (styleTag) {
    styleTag.remove()
    styleTag = null
  }
  if (props.mode === 'inline') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div>
    <span @click="invalidVisit" class="invalid-visit">Invalid Visit</span>
  </div>
</template>
