<script setup lang="ts">
import { Link, useRemember } from '@inertiajs/vue3'
import { ref } from 'vue'
import Notes from '../Components/Notes.vue'

const users = [
  { id: 1, name: 'User One' },
  { id: 2, name: 'User Two' },
  { id: 3, name: 'User Three' },
]

const selection = useRemember({ ids: [] as number[] }, 'Users/Selected')
const showNotes = ref(false)
</script>

<template>
  <div>
    <nav>
      <Link href="/remember/tabs/users">Users</Link>
      <Link href="/remember/tabs/teams">Teams</Link>
      <a href="/non-inertia">Navigate off-site</a>
    </nav>

    <h1>Users</h1>
    <p id="selected">{{ selection.ids.length }} selected</p>

    <label v-for="user in users" :key="user.id">
      <input type="checkbox" :value="user.id" v-model="selection.ids" />
      {{ user.name }}
    </label>

    <button @click="showNotes = !showNotes">Toggle notes</button>
    <Notes v-if="showNotes" />
  </div>
</template>
