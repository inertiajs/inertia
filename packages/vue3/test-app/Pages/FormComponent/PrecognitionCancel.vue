<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Cancel Tests</h1>

    <h2>Auto Cancel Test</h2>
    <Form
      action="/form-component/precognition?slow=1"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <p v-if="validating" class="validating">Validating...</p>

      <div>
        <input id="auto-cancel-name-input" name="name" @blur="validate('name')" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <button type="submit">Submit</button>
    </Form>

    <hr />

    <h2>Manual Cancel Test</h2>
    <Form
      action="/form-component/precognition?slow=1"
      method="post"
      :validate-timeout="5000"
      #default="{ validate, cancelValidation, validating }"
    >
      <p v-if="validating" class="validating">Validating...</p>

      <div>
        <input id="manual-cancel-name-input" name="name" @blur="validate('name')" />
      </div>

      <button type="button" @click="cancelValidation">Cancel Validation</button>
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
