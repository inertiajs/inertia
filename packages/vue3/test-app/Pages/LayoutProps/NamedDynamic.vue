<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'
import { setLayoutProps } from '@inertiajs/vue3'

defineOptions({
  layout: {
    app: [AppLayout, { title: 'Named Dynamic Page' }],
    content: [ContentLayout, { padding: 'md' }],
  },
})
</script>

<template>
  <div>
    <h2>Named Dynamic Layout Page</h2>

    <button type="button" @click="setLayoutProps('app', { title: 'Updated App Title' })">Update App Title</button>
    <button type="button" @click="setLayoutProps('content', { padding: 'xl' })">Update Content Padding</button>
  </div>
</template>
