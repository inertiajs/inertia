<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'

defineProps<{ titleSuffix?: string }>()

function replaceProp() {
  router.replaceProp('titleSuffix', 'replaced')
}
</script>

<template>
  <Head title="Callback Page" />

  <h1>Title Callback Page</h1>

  <Link href="/head/reactive">Go to reactive</Link>

  <button @click="replaceProp">Replace prop</button>

  <p>Current suffix: {{ titleSuffix ?? 'none' }}</p>
</template>
