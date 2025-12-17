<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import MethodsTestComponent from './Context/MethodsTestComponent.vue'
</script>

<template>
  <Form action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors }">
    <div id="parent-state">
      <span id="parent-is-dirty">{{ isDirty }}</span>
      <span id="parent-has-errors">{{ hasErrors }}</span>
      <pre v-if="hasErrors" id="parent-errors">{{ JSON.stringify(errors, null, 2) }}</pre>
    </div>

    <input type="text" name="name" id="name" value="Initial Name" />
    <input type="email" name="email" id="email" value="initial@example.com" />
    <textarea name="bio" id="bio">Initial bio</textarea>

    <MethodsTestComponent />
  </Form>
</template>
