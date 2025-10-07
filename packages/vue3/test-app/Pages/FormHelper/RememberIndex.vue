<script setup>
import { Link } from '@inertiajs/vue3'

defineProps({
  users: Array,
})
</script>

<template>
  <div>
    <h1>Users Index</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        <Link :href="`/remember/users/${user.id}/edit`">Edit {{ user.name }}</Link>
      </li>
    </ul>
  </div>
</template>
