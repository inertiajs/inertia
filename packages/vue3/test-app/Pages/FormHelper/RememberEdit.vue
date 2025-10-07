<script setup>
import { useForm } from '@inertiajs/vue3'

const props = defineProps({
  user: Object,
  withRememberKey: {
    type: Boolean,
    default: false,
  },
})

const form = props.withRememberKey
  ? useForm('EditUserForm', {
      name: props.user.name,
      email: props.user.email,
    })
  : useForm({
      name: props.user.name,
      email: props.user.email,
    })
</script>

<template>
  <div>
    <h1>Edit User {{ user.id }}</h1>
    <p>With remember key: {{ withRememberKey }}</p>
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
