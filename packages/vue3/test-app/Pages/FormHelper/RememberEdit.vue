<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const props = defineProps({
  user: {
    type: Object as () => { id: number; name: string; email: string },
    required: true,
  },
})

const form = useForm('EditUserForm', {
  name: props.user.name,
  email: props.user.email,
})
</script>

<template>
  <div>
    <h1>Edit User {{ user.id }}</h1>
    <form>
      <div>
        <label>Name:</label>
        <input v-model="form.name" type="text" />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="form.email" type="email" />
      </div>
    </form>
  </div>
</template>
