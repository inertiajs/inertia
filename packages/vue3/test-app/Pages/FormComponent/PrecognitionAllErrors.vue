<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition - All Errors</h1>

    <Form
      action="/form-component/precognition-array-errors"
      method="post"
      :validate-timeout="100"
      :simple-validation-errors="false"
      #default="{ invalid, errors, validate, valid, validating }"
    >
      <p v-if="validating">Validating...</p>

      <div>
        <input name="name" @blur="validate('name')" />
        <div v-if="invalid('name')">
          <template v-if="Array.isArray(errors.name)">
            <p v-for="(error, index) in errors.name" :key="index" :data-testid="`name-error-${index}`">
              {{ error }}
            </p>
          </template>
          <p v-else data-testid="name-error-0">{{ errors.name }}</p>
        </div>
        <p v-if="valid('name')">Name is valid!</p>
      </div>

      <div>
        <input name="email" @blur="validate('email')" />
        <div v-if="invalid('email')">
          <template v-if="Array.isArray(errors.email)">
            <p v-for="(error, index) in errors.email" :key="index" :data-testid="`email-error-${index}`">
              {{ error }}
            </p>
          </template>
          <p v-else data-testid="email-error-0">{{ errors.email }}</p>
        </div>
        <p v-if="valid('email')">Email is valid!</p>
      </div>
    </Form>
  </div>
</template>
