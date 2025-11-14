<script setup lang="ts">
import { router, WhenVisible } from '@inertiajs/vue3'

defineProps<{
  lazyData?: {
    text: string
  }
}>()
</script>

<template>
  <div>
    <h1>WhenVisible + Reload</h1>

    <button @click="router.reload()">Reload Page</button>

    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <WhenVisible data="lazyData">
        <template #fallback>
          <p>Loading lazy data...</p>
        </template>

        {{ lazyData?.text }}
      </WhenVisible>
    </div>
  </div>
</template>
