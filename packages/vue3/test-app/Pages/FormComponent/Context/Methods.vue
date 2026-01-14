<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import MethodsTestComponent from './MethodsTestComponent.vue'
</script>

<template>
  <Form action="/form-component/context/methods" method="post" #default="{ errors }">
    <pre v-if="Object.keys(errors).length">{{ JSON.stringify(errors, null, 2) }}</pre>

    <input type="text" name="name" value="Initial Name" />
    <input type="email" name="email" value="initial@example.com" />
    <textarea name="bio">Initial bio</textarea>

    <MethodsTestComponent />
  </Form>
</template>
