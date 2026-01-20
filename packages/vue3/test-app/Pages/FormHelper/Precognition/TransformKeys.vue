<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  document: {
    customer: { email: '' },
  },
})
  .withPrecognition('post', '/precognition/transform-keys')
  .setValidationTimeout(100)
  .transform((data) => ({ ...data.document }))
</script>

<template>
  <div>
    <div>
      <input
        id="email-input"
        v-model="form.document.customer.email"
        name="customer.email"
        placeholder="Email"
        @blur="form.validate('customer.email')"
      />
      <p v-if="form.invalid('customer.email')">
        {{ form.errors['customer.email'] }}
      </p>
      <p v-if="form.valid('customer.email')">Email is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
  </div>
</template>
