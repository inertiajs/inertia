<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue3'

defineProps<{
  dataOnlyProp?: { text: string }
  mergedProp?: { text: string }
  mergedWithCallbackProp?: { text: string }
}>()
</script>

<template>
  <div id="data-only" style="margin-top: 3000px">
    <WhenVisible data="dataOnlyProp">
      <template #fallback>
        <div>Loading data only...</div>
      </template>
      <div>Data only loaded: {{ dataOnlyProp?.text }}</div>
    </WhenVisible>
  </div>

  <div id="merged" style="margin-top: 5000px">
    <WhenVisible
      data="mergedProp"
      :params="{
        data: { extra: 'from-params' },
      }"
    >
      <template #fallback>
        <div>Loading merged...</div>
      </template>
      <div>Merged loaded: {{ mergedProp?.text }}</div>
    </WhenVisible>
  </div>

  <div id="merged-with-callback" style="margin-top: 5000px">
    <WhenVisible
      data="mergedWithCallbackProp"
      :params="{
        data: { page: '2' },
        preserveUrl: true,
      }"
    >
      <template #fallback>
        <div>Loading merged with callback...</div>
      </template>
      <div>Merged with callback loaded: {{ mergedWithCallbackProp?.text }}</div>
    </WhenVisible>
  </div>
</template>
