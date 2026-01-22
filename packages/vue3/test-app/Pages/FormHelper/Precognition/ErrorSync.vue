<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('post', '/precognition/error-sync')
  .setValidationTimeout(100)

const handleSubmit = () => {
  form.submit()
}
</script>

<template>
  <div>
    <h1>Precognition Error Sync Test (Form Helper)</h1>

    <form @submit.prevent="handleSubmit">
      <div>
        <input v-model="form.name" name="name" placeholder="Name" @blur="form.validate('name')" />
        <p v-if="form.invalid('name')" id="name-error">
          {{ form.errors.name }}
        </p>
      </div>

      <div>
        <input v-model="form.email" name="email" placeholder="Email" @blur="form.validate('email')" />
        <p v-if="form.invalid('email')" id="email-error">
          {{ form.errors.email }}
        </p>
      </div>

      <p v-if="form.validating" id="validating">Validating...</p>

      <button type="submit" id="submit-btn">Submit</button>
    </form>
  </div>
</template>
