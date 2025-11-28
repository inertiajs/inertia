<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition - Array Errors</h1>

    <Form
      action="/precognition/with-all-errors"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, valid, validating }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
        <p v-if="valid('name')">Name is valid!</p>
      </div>

      <div>
        <input name="email" placeholder="Email" @blur="validate('email')" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
        <p v-if="valid('email')">Email is valid!</p>
      </div>

      <p v-if="validating">Validating...</p>
    </Form>
  </div>
</template>
