<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

defineProps<{
  title: string
}>()
</script>

<template>
  <Head :title="title" />
  <div>
    <p>Head title escaping test</p>
  </div>
</template>
