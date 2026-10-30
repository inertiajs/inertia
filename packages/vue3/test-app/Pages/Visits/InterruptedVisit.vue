<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ user: string; status: string }>()

const postComment = () => router.post('/visits/interrupted-visit', {}, { only: ['status'] })

const releaseHeldComponent = () => window.releaseHeldComponent?.()
</script>

<template>
  <div>
    <div>Signed in as {{ user }}</div>
    <div>Status: {{ status }}</div>

    <Link href="/visits/interrupted-visit/held">Open the held page</Link>
    <Link href="/visits/interrupted-visit/prefetched" prefetch="mount">Open the prefetched held page</Link>
    <Link href="/visits/interrupted-visit/slow" prefetch="click">Open the slow prefetched page</Link>
    <Link href="/visits/interrupted-visit/clear-history">Open the history clearing page</Link>
    <button @click="postComment">Post comment</button>
    <button @click="releaseHeldComponent">Release held component</button>
  </div>
</template>
