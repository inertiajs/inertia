<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const props = defineProps<{
  feed: {
    posts: { id: number; title: string }[]
    meta: { page: number }
  }
}>()

const loadMore = () => {
  router.reload({
    only: ['feed'],
    data: { page: props.feed.meta.page + 1 },
  })
}
</script>

<template>
  <p id="posts">{{ feed.posts.map((p) => p.title).join(', ') }}</p>
  <p id="meta">Page: {{ feed.meta.page }}</p>
  <button @click="loadMore">Load More</button>
</template>
