<script setup lang="ts">
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
