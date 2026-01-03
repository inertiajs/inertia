<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import MethodsTestComponent from './MethodsTestComponent.vue'
</script>

<template>
  <Form action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors }">
    <div>
      <span>{{ isDirty }}</span>
      <span>{{ hasErrors }}</span>
      <pre v-if="hasErrors">{{ JSON.stringify(errors, null, 2) }}</pre>
    </div>

    <input type="text" name="name" value="Initial Name" />
    <input type="email" name="email" value="initial@example.com" />
    <textarea name="bio">Initial bio</textarea>

    <MethodsTestComponent />
  </Form>
</template>
