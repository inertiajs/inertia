<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition Error Sync Test</h1>

    <Form
      action="/precognition/error-sync"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')" id="name-error">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <input name="email" placeholder="Email" @blur="validate('email')" />
        <p v-if="invalid('email')" id="email-error">
          {{ errors.email }}
        </p>
      </div>

      <p v-if="validating" id="validating">Validating...</p>

      <button type="submit" id="submit-btn">Submit</button>
    </Form>
  </div>
</template>
