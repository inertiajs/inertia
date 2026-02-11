<script setup lang="ts">
import { config, Form } from '@inertiajs/vue3'

// Set global config for withAllErrors (no prop on the Form component)
config.set('form.withAllErrors', true)
</script>

<template>
  <div>
    <h1>Form Precognition - All Errors via Config</h1>

    <Form
      action="/precognition/with-all-errors"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, valid, validating }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="validate('name')" />
        <div v-if="invalid('name')">
          <template v-if="Array.isArray(errors.name)">
            <p v-for="(error, index) in errors.name" :key="index" :id="`name-error-${index}`">
              {{ error }}
            </p>
          </template>
          <p v-else id="name-error-0">{{ errors.name }}</p>
        </div>
        <p v-if="valid('name')">Name is valid!</p>
      </div>

      <div>
        <input name="email" placeholder="Email" @blur="validate('email')" />
        <div v-if="invalid('email')">
          <template v-if="Array.isArray(errors.email)">
            <p v-for="(error, index) in errors.email" :key="index" :id="`email-error-${index}`">
              {{ error }}
            </p>
          </template>
          <p v-else id="email-error-0">{{ errors.email }}</p>
        </div>
        <p v-if="valid('email')">Email is valid!</p>
      </div>

      <p v-if="validating">Validating...</p>
    </Form>
  </div>
</template>
