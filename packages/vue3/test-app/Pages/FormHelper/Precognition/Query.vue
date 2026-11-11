<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('query', '/precognition/default')
  .setValidationTimeout(100)
</script>

<template>
  <div>
    <h1>Form Helper Precognition (QUERY)</h1>

    <div>
      <input name="name" v-model="form.name" placeholder="Name" @blur="form.validate('name')" />
      <p v-if="form.invalid('name')">
        {{ form.errors.name }}
      </p>
      <p v-if="form.valid('name')">Name is valid!</p>
    </div>

    <div>
      <input name="email" v-model="form.email" placeholder="Email" @blur="form.validate('email')" />
      <p v-if="form.invalid('email')">
        {{ form.errors.email }}
      </p>
      <p v-if="form.valid('email')">Email is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>

    <button type="button" @click="form.submit()">Submit</button>
  </div>
</template>
