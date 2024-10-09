<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue3'
</script>

<template>
  <div style="margin-top: 5000px">
    <WhenVisible data="foo">
      <template #fallback>
        <div>Loading first one...</div>
      </template>

      <div>First one is visible!</div>
    </WhenVisible>
  </div>

  <div style="margin-top: 5000px">
    <WhenVisible :buffer="1000" data="foo">
      <template #fallback>
        <div>Loading second one...</div>
      </template>

      <div>Second one is visible!</div>
    </WhenVisible>
  </div>

  <div style="margin-top: 5000px">
    <WhenVisible data="foo" always>
      <template #fallback>
        <div>Loading third one...</div>
      </template>

      <div>Third one is visible!</div>
    </WhenVisible>
  </div>
</template>
