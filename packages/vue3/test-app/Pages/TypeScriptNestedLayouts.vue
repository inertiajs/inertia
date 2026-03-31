<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import TypedLayoutA from '@/Layouts/TypedLayoutA.vue'
import TypedLayoutB from '@/Layouts/TypedLayoutB.vue'
import TypedLayoutC from '@/Layouts/TypedLayoutC.vue'

defineOptions({
  layout: [TypedLayoutA, TypedLayoutB, TypedLayoutC],
})
</script>

<template>
  <div />
</template>
