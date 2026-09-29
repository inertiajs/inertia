<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
}>()

const characterCount = computed(() => props.text.length)
const replacementCount = computed(() => (props.text.match(/�/g) || []).length)
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR Multi-Byte Body</h1>
    <p data-testid="character-count">Characters: {{ characterCount }}</p>
    <p data-testid="replacement-count">Replacement characters: {{ replacementCount }}</p>
    <p data-testid="text">{{ text }}</p>
  </div>
</template>
