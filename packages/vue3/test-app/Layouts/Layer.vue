<script setup lang="ts">
import { Layer, useLayer, usePage } from '@inertiajs/vue3'

defineProps<{
  open: boolean
  index: number
  isTop: boolean
  type: 'routed' | 'local'
  close: () => void
  done: () => void
}>()

const page = usePage()
const layer = useLayer()
</script>

<template>
  <Layer v-bind="$props" :label="layer.id ? page.component : 'unresolved'"><slot /></Layer>
</template>
