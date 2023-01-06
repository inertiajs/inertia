<script>
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup>
import { Head } from '@inertiajs/vue2'

defineProps({ user: Object })
</script>

<template>
  <div>
    <Head title="User" />
    <h1 class="text-3xl">User</h1>
    <p class="mt-6">You successfully created a new user! Well not really, there is no persistence in this app.</p>
    <ul class="mt-6 space-y-2">
      <li><strong>Name:</strong> {{ user.name }}</li>
      <li><strong>Company:</strong> {{ user.company }}</li>
      <li><strong>Role:</strong> {{ user.role }}</li>
    </ul>
  </div>
</template>
