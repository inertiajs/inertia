<script setup lang="ts">
import { useProp } from '@inertiajs/vue3'

defineProps<{ plain: string }>()

const { value: order, loading } = useProp<string>('order')
</script>

<template>
  <div>Live layer</div>

  <div id="layer-order">{{ order }}</div>
  <div id="layer-order-loading">{{ loading }}</div>
  <div id="layer-plain">{{ plain }}</div>
</template>
