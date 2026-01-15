<script setup lang="ts">
import { InfiniteScroll, useForm } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const form = useForm({
  name: '',
})

const submit = () => {
  form.post('/infinite-scroll/preserve-errors')
}
</script>

<template>
  <p v-if="$page.props.errors?.name" id="page-error">{{ $page.props.errors.name }}</p>
  <p v-if="form.errors.name" id="form-error">{{ form.errors.name }}</p>

  <button type="button" @click="submit">Submit</button>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    <template #previous="{ loading, fetch, hasMore }">
      <button v-if="hasMore" @click="fetch" id="load-previous">
        {{ loading ? 'Loading previous items...' : 'Load previous items' }}
      </button>
    </template>

    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #next="{ loading, fetch, hasMore }">
      <button v-if="hasMore" @click="fetch" id="load-next">
        {{ loading ? 'Loading next items...' : 'Load next items' }}
      </button>
    </template>
  </InfiniteScroll>
</template>
