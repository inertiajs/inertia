<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/vue3'
import Child from './Child.vue'

const form = useForm({
  name: 'foo',
  remember: false,
})
</script>

<template>
  <Child :form />
</template>
