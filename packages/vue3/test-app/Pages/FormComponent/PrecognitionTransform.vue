<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition Transform</h1>

    <Form
      action="/form-component/precognition-transform"
      method="post"
      :validateTimeout="100"
      :transform="(data) => ({ name: data.name.toUpperCase() })"
    >
      <template #default="{ invalid, errors, validate, valid, validating }">
        <p v-if="validating">Validating...</p>

        <div>
          <input name="name" @blur="() => validate('name')" />
          <p v-if="invalid('name')">{{ errors.name }}</p>
          <p v-if="valid('name')">Name is valid!</p>
        </div>
      </template>
    </Form>
  </div>
</template>
