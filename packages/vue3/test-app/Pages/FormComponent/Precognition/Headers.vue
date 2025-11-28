<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Custom Headers</h1>

    <Form
      action="/precognition/headers"
      method="post"
      :headers="{ 'X-Custom-Header': 'custom-value' }"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
      </div>

      <p v-if="validating">Validating...</p>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
