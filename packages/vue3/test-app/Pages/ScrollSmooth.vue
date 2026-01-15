<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  page: 'long' | 'short'
}>()

document.documentElement.style.scrollBehavior = 'smooth'
</script>

<template>
  <div>
    <h1>{{ page === 'long' ? 'Long Page' : 'Short Page' }}</h1>

    <div :style="{ height: page === 'long' ? '2000px' : '100px' }"></div>

    <Link v-if="page === 'long'" href="/scroll-smooth/short">Go to Short Page</Link>
    <Link v-else href="/scroll-smooth/long">Go to Long Page</Link>
  </div>
</template>
