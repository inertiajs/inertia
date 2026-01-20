<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  mixed: {
    name: string
    users: string[]
    chat: { data: number[] }
    post: { id: number; comments: { allowed: boolean; data: string[] } }
  }
}>()

const reload = () => {
  router.reload({
    only: ['mixed'],
  })
}
</script>

<template>
  <div>
    <div>name is {{ mixed.name }}</div>
    <div>users: {{ mixed.users.join(', ') }}</div>
    <div>chat.data: {{ mixed.chat.data.join(', ') }}</div>
    <div>post.id: {{ mixed.post.id }}</div>
    <div>post.comments.allowed: {{ mixed.post.comments.allowed ? 'true' : 'false' }}</div>
    <div>post.comments.data: {{ mixed.post.comments.data.join(', ') }}</div>
    <button @click="reload">Reload</button>
  </div>
</template>
