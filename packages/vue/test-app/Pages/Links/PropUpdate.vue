<script setup>
import { Link } from '@inertiajs/vue3'
import { ref } from 'vue'

const href = ref('/sleep')
</script>

<template>
  <div>
    <button @click.prevent="href = '/something-else'">Change URL</button>
    <Link :href="href">The Link</Link>
  </div>
</template>
