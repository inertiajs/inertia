<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'

defineProps<{
  foo: string
  next: string
}>()

const override = new URLSearchParams(window.location.search).has('override')

function replaceHead() {
  router.replaceProp('head', [
    '<title data-inertia="title">Replaced Head</title>',
    '<meta data-inertia="description" name="description" content="Replaced description">',
  ])
}
</script>

<template>
  <div>
    <Head v-if="override">
      <meta head-key="description" name="description" content="Page override" />
    </Head>
    <h1>Server Head</h1>
    <p id="foo">{{ foo }}</p>
    <button @click="router.reload({ only: ['foo'] })">Reload foo</button>
    <button @click="replaceHead">Replace head client-side</button>
    <Link :href="next">Next server head page</Link>
  </div>
</template>
