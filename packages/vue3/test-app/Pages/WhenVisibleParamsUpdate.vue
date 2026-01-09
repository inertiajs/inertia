<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps({
  lazyData: Object,
})

const paramValue = ref('initial')
</script>

<template>
  <div>
    <button @click="paramValue = 'updated'">Update Param</button>
    <p>Current param: {{ paramValue }}</p>

    <div style="margin-top: 3000px">
      <WhenVisible data="lazyData" :params="{ data: { paramValue } }" always>
        <div>
          <p>Data loaded: {{ lazyData?.text }}</p>
        </div>
        <template #fallback>
          <p>Loading lazy data...</p>
        </template>
      </WhenVisible>
    </div>
  </div>
</template>
