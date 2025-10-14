<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const validateFilesEnabled = ref(false)
</script>

<template>
  <div>
    <h1>Form Precognition Files</h1>

    <Form
      action="/form-component/precognition-files"
      method="post"
      :validate-timeout="100"
      :validate-files="validateFilesEnabled"
      #default="{ invalid, errors, validate, valid, validating, touch }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
        <p v-if="valid('name')">Name is valid!</p>
      </div>

      <div>
        <input type="file" name="avatar" id="avatar" />
        <p v-if="invalid('avatar')">
          {{ errors.avatar }}
        </p>
        <p v-if="valid('avatar')">Avatar is valid!</p>
      </div>

      <p v-if="validating">Validating...</p>

      <button type="button" @click="validateFilesEnabled = !validateFilesEnabled">
        Toggle Validate Files ({{ validateFilesEnabled ? 'enabled' : 'disabled' }})
      </button>

      <button type="button" @click="validate(['name', 'avatar'])">Validate Both</button>
    </Form>
  </div>
</template>
