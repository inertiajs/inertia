<script setup lang="ts">
import { useRemember } from '@inertiajs/vue3'

const remembered = useRemember({ note: '' })
</script>

<template>
  <div data-testid="ssr-layer">SSR layer</div>
  <input v-model="remembered.note" data-testid="ssr-layer-note" />
</template>
