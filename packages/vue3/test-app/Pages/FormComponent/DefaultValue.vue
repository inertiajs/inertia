<script setup lang="ts">
import { Form } from '@inertiajs/vue3'

defineProps<{
  user: {
    name: string
  }
}>()
</script>

<template>
  <Form action="/form-component/default-value" method="patch" v-slot="{ errors }">
    <h1>Form Default Values</h1>

    <div>
      <label for="name">Name</label>
      <input type="text" name="name" id="name" :defaultValue="user.name" />
      <div id="error_name">{{ errors['user.name'] }}</div>
    </div>

    <button type="submit">Submit</button>
  </Form>
</template>
