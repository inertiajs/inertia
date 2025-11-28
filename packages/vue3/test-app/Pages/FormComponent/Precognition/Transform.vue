<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition Transform</h1>

    <Form
      action="/precognition/default"
      method="post"
      :validationTimeout="100"
      :transform="(data) => ({ name: String(data.name || '').repeat(2) })"
    >
      <template #default="{ invalid, errors, validate, valid, validating }">
        <div>
          <input name="name" placeholder="Name" @blur="() => validate('name')" />
          <p v-if="invalid('name')">{{ errors.name }}</p>
          <p v-if="valid('name')">Name is valid!</p>
        </div>

        <p v-if="validating">Validating...</p>
      </template>
    </Form>
  </div>
</template>
