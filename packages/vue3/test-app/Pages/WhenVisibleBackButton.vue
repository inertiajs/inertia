<script setup lang="ts">
import { Link, WhenVisible } from '@inertiajs/vue3'

defineProps<{
  lazyData?: {
    text: string
  }
}>()
</script>

<template>
  <div>
    <h1>WhenVisible + Back Button</h1>

    <Link href="/links/method">Navigate Away</Link>

    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <WhenVisible data="lazyData">
        <template #fallback>
          <p>Loading lazy data...</p>
        </template>

        <p>{{ lazyData?.text }}</p>
      </WhenVisible>
    </div>

    <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
      <WhenVisible data="lazyData" always>
        <template #fallback>
          <p>Loading always data...</p>
        </template>

        <p>Always: {{ lazyData?.text }}</p>
      </WhenVisible>
    </div>
  </div>
</template>
