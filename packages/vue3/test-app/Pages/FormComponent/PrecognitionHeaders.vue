<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Custom Headers</h1>

    <Form
      action="/form-component/precognition-headers"
      method="post"
      :headers="{ 'X-Custom-Header': 'custom-value' }"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <p v-if="validating">Validating...</p>

      <div>
        <input name="name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
      </div>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
