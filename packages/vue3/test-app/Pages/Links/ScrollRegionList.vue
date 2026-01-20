<script setup lang="ts">
import WithScrollRegion from '@/Layouts/WithScrollRegion.vue'
import { VisitHelperOptions } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'

defineProps({
  user_id: Number,
})

const navigate = (id: number, options: VisitHelperOptions = {}) => {
  router.get(`/links/scroll-region-list/user/${id}`, {}, options)
}

const users = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
</script>

<template>
  <WithScrollRegion>
    <div>
      <span class="text">Scrollable list with scroll region</span>
      <div class="user-text">Clicked user: {{ user_id || 'none' }}</div>

      <div v-for="user in users" :key="user.id" style="padding: 20px; border-bottom: 1px solid #ccc">
        <div style="margin-bottom: 10px; width: 500px">{{ user.name }}</div>
        <button @click="navigate(user.id)">Default</button>
        <button @click="navigate(user.id, { preserveScroll: true })">Preserve True</button>
        <button @click="navigate(user.id, { preserveScroll: false })">Preserve False</button>
      </div>
    </div>
  </WithScrollRegion>
</template>
