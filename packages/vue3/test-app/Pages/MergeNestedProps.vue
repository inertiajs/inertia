<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const props = defineProps<{
  users: { data: { id: number; name: string }[]; meta: { page: number; perPage: number } }
}>()

const loadMore = () => {
  router.reload({
    only: ['users'],
    data: { page: props.users.meta.page + 1 },
  })
}
</script>

<template>
  <div>
    <p id="users">{{ users.data.map((user) => user.name).join(', ') }}</p>
    <p id="meta">Page: {{ users.meta.page }}, Per Page: {{ users.meta.perPage }}</p>
    <button @click="loadMore">Load More</button>
  </div>
</template>
