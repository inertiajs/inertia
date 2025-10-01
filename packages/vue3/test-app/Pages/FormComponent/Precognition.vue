<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition</h1>

    <Form action="/form-component/precognition" method="post" #default="{ invalid, errors, validate, validating }">
      <p v-if="validating">Validating...</p>

      <div>
        <input name="name" @blur="validate('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <input name="email" @blur="validate('email')" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
      </div>

      <div>
        <input name="token" @blur="validate('token')" value="default" />
        <p v-if="invalid('token')">
          {{ errors.token }}
        </p>
      </div>
    </Form>
  </div>
</template>
