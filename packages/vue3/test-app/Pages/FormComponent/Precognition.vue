<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition</h1>

    <Form
      action="/form-component/precognition"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, valid, validating }"
    >
      <p v-if="validating">Validating...</p>

      <div>
        <input name="name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
        <p v-if="valid('name')">Name is valid!</p>
      </div>

      <div>
        <input name="email" @blur="validate('email')" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
        <p v-if="valid('email')">Email is valid!</p>
      </div>
    </Form>
  </div>
</template>
