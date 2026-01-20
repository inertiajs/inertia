<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed, ref, watchEffect } from 'vue'

const resolverPage = ref(window.resolverReceivedPage)

watchEffect(() => {
  resolverPage.value = window.resolverReceivedPage
})

const componentName = computed(() => resolverPage.value?.component ?? 'N/A')
const pageUrl = computed(() => resolverPage.value?.url ?? 'N/A')
</script>

<template>
  <div>
    <h1>Second Resolver Page</h1>
    <div id="resolver-component">Component: {{ componentName }}</div>
    <div id="resolver-url">URL: {{ pageUrl }}</div>
    <Link id="go-to-first" href="/resolver-page">Go to First Page</Link>
  </div>
</template>
