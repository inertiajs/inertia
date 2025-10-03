<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition Validate</h1>

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
        <input name="email" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
      </div>

      <button type="button" @click="validate('name')">Validate Name</button>
      <button type="button" @click="validate(['name', 'email'])">Validate Name and Email</button>
    </Form>
  </div>
</template>
