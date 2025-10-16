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
      <div>
        <input id="auto-cancel-name-input" name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <p v-if="validating" class="validating">Validating...</p>

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
      <div>
        <input id="manual-cancel-name-input" name="name" placeholder="Name" @blur="validate('name')" />
      </div>

      <p v-if="validating" class="validating">Validating...</p>

      <button type="button" @click="cancelValidation">Cancel Validation</button>
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
