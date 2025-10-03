<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition Touch</h1>

    <Form
      action="/form-component/precognition"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, touch, validating }"
    >
      <p v-if="validating">Validating...</p>

      <div>
        <input name="name" @blur="touch('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <input name="email" @blur="touch('email')" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
      </div>

      <button type="button" @click="validate()">Validate All Touched</button>
      <button type="button" @click="touch(['name', 'email'])">Touch Name and Email</button>
      <button
        type="button"
        @click="
          () => {
            touch('name')
            touch('name')
          }
        "
      >
        Touch Name Twice
      </button>
    </Form>
  </div>
</template>
