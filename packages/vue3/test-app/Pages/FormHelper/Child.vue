<script setup lang="ts">
import type { InertiaForm } from '@inertiajs/vue3'
import { toRef } from 'vue'

const props = defineProps<{
  form: InertiaForm<{
    name: string
    email?: string
  }>
}>()

const form = toRef(props, 'form')
</script>

<template>
  <p>Name: {{ form.name }}</p>
  <p>Email: {{ form.email }}</p>
</template>
