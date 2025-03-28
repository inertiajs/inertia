<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue'
import { ref } from 'vue'

const count = ref(0)
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

  <div style="margin-top: 5000px">
    <WhenVisible data="foo">
      <template #fallback>
        <div>Loading fourth one...</div>
      </template>
    </WhenVisible>
  </div>

  <div style="margin-top: 6000px">
    <WhenVisible
      always
      :params="{
        data: {
          count,
        },
        onSuccess: () => {
          count += 1
        },
      }"
    >
      <template #fallback>
        <div>Loading fifth one...</div>
      </template>

      <div>Count is now {{ count }}</div>
    </WhenVisible>
  </div>
</template>
