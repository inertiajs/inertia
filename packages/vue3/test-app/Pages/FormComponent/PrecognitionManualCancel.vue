<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Precognition - Manual Cancel</h1>

    <Form
      action="/form-component/precognition?slow=1"
      method="post"
      :validate-timeout="100"
      #default="{ validate, cancelValidation, validating }"
    >
      <p v-if="validating" class="validating">Validating...</p>

      <div>
        <input id="name-input" name="name" @blur="validate('name')" />
      </div>

      <button type="button" @click="cancelValidation">Cancel Validation</button>
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
