<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Auto Cancel</h1>

    <Form
      action="/form-component/precognition?slow=1"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <p v-if="validating" class="validating">Validating...</p>

      <div>
        <input id="name-input" name="name" @blur="validate('name')" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
