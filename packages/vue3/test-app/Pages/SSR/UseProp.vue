<script setup lang="ts">
import { useProp } from '@inertiajs/vue3'

const { value: orders, loading } = useProp<string>('orders')
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR useProp</h1>
    <p id="orders" :class="{ loading }">orders: {{ orders ?? 'none' }}, loading: {{ loading }}</p>
  </div>
</template>
