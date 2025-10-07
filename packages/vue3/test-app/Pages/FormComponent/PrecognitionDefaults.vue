<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const formRef = ref()

const handleSetDefaults = () => {
  formRef.value.defaults()
}
</script>

<template>
  <div>
    <h1>Precognition - Defaults Updates Validator</h1>

    <Form
      ref="formRef"
      action="/form-component/precognition"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <p v-if="validating" class="validating">Validating...</p>

      <div>
        <input id="name-input" name="name" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <button type="button" @click="handleSetDefaults">Set Defaults</button>
      <button type="button" @click="validate('name')">Validate Name</button>
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
