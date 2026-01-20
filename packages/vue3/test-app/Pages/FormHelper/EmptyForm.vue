<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

interface FormData {
  name: string
  email: string
}

const form = useForm<FormData>()

const submit = () => {
  form.transform(() => ({
    name: 'John Doe',
    email: 'john@example.com',
  }))
  form.post('/dump/post')
}
</script>

<template>
  <div>
    <button @click="submit">Submit</button>
  </div>
</template>
