<script setup>
import { defineLayout } from '@inertiajs/vue3'
import Layout from '../Components/Layout.vue'

defineLayout(Layout)
defineProps(['users'])
</script>

<template>
  <h1 class="text-3xl">Users</h1>
  <table>
    <thead>
      <tr>
        <th class="px-4 py-2">Id</th>
        <th class="px-4 py-2">Name</th>
        <th class="px-4 py-2">Email</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td class="border px-4 py-2">{{ user.id }}</td>
        <td class="border px-4 py-2">{{ user.name }}</td>
        <td class="border px-4 py-2">{{ user.email }}</td>
      </tr>
    </tbody>
  </table>
</template>
