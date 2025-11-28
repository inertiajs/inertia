<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Cancel Tests</h1>

    <h2>Auto Cancel Test</h2>
    <Form
      action="/precognition/default?slow=1"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <div>
        <input id="auto-cancel-name-input" name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <p v-if="validating" class="validating">Validating...</p>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
