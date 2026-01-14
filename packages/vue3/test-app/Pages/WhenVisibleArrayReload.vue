<script setup lang="ts">
import { router, WhenVisible } from '@inertiajs/vue3'

defineProps<{
  firstData?: {
    text: string
  }
  secondData?: {
    text: string
  }
}>()
</script>

<template>
  <div>
    <h1>WhenVisible + Array Props + Reload</h1>

    <button @click="router.reload()">Reload Page</button>

    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <WhenVisible :data="['firstData', 'secondData']">
        <template #fallback>
          <p>Loading array data...</p>
        </template>

        <div>
          <p>{{ firstData?.text }}</p>
          <p>{{ secondData?.text }}</p>
        </div>
      </WhenVisible>
    </div>
  </div>
</template>
