<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, router, usePage } from '@inertiajs/vue3'
import { onMounted } from 'vue'

const page = usePage()

defineProps({ users: Array })

onMounted(() => {
  router.reload({
    only: ['users'],
  })
})
</script>

<template>
  <Head title="User" />
  <button></button>
  <h1 class="text-3xl">Users</h1>
  <div class="my-4 border p-4">
    <div><strong>Using $page.props:</strong> {{ $page.props.appName }}</div>
    <div><strong>Using usePage():</strong> {{ page.props.appName }}</div>
  </div>
  <div class="mt-6 w-full max-w-2xl overflow-hidden rounded border shadow-sm">
    <table class="w-full text-left">
      <thead>
        <tr>
          <th class="px-4 py-2">Id</th>
          <th class="px-4 py-2">Name</th>
          <th class="px-4 py-2">Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users" v-for="user in users" :key="user.id" class="border-t">
          <td class="px-4 py-2">{{ user.id }}</td>
          <td class="px-4 py-2">{{ user.name }}</td>
          <td class="px-4 py-2">{{ user.email }}</td>
        </tr>
        <tr v-else="users" class="border-t">
          <td class="px-4 py-2" colspan="3">Loading...</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
