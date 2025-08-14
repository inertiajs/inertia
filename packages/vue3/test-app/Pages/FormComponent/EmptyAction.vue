<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Empty Action Test</h1>

    <Form method="post" #default="{ errors }">
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
        <p v-if="errors.name" id="error_name">{{ errors.name }}</p>
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  </div>
</template>
