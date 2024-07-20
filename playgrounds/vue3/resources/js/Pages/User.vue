<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { useHead } from 'unhead';
useHead({
    title: 'User'
})

defineProps({ user: Object })
</script>

<template>
  <h1 class="text-3xl">User</h1>
  <p class="mt-6">You successfully created a new user! Well not really, there is no persistence in this app.</p>
  <ul class="mt-6 space-y-2">
    <li><strong>Name:</strong> {{ user.name }}</li>
    <li><strong>Company:</strong> {{ user.company }}</li>
    <li><strong>Role:</strong> {{ user.role }}</li>
  </ul>
</template>
