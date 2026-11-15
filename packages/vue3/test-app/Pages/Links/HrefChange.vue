<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { ref } from 'vue'

const href = ref('/dump/get?step=one')
</script>

<template>
  <div>
    <button @click.prevent="href = '/dump/get?step=two'">Change URL</button>
    <Link :href="href">The Link</Link>
  </div>
</template>
