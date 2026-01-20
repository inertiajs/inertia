<script setup lang="ts">
import { Form } from '@inertiajs/vue3'

// Transform flattens the structure: { document: { customer: {...} } } -> { customer: {...} }
const transformData = (data: Record<string, any>) => {
  const document = data.document || {}
  return document
}
</script>

<template>
  <div>
    <h1>Form Precognition Transform Keys</h1>

    <Form action="/precognition/transform-keys" method="post" :validationTimeout="100" :transform="transformData">
      <template #default="{ invalid, errors, validate, valid, validating }">
        <div>
          <input id="email-input" name="document[customer][email]" placeholder="Email" @blur="() => validate('customer.email')" />
          <p v-if="invalid('customer.email')">{{ errors['customer.email'] }}</p>
          <p v-if="valid('customer.email')">Email is valid!</p>
        </div>

        <p v-if="validating">Validating...</p>
      </template>
    </Form>
  </div>
</template>
