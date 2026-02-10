<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { createForm } from '@inertiajs/vue3'

interface UserForm {
  name: string
  email: string
}

const Form = createForm<UserForm>()
</script>

<template>
  <Form action="/users" method="post" v-slot="{ errors, getData, clearErrors, reset, setError, valid, invalid }">
    <!-- Test typed errors -->
    {{ errors.name }}
    {{ errors.email }}

    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ errors.invalid_field }}

    <!-- Test getData returns typed data -->
    {{ getData().name }}
    {{ getData().email }}

    <!-- Test clearErrors with typed fields -->
    {{ clearErrors('name') }}
    {{ clearErrors('email') }}
    {{ clearErrors('name', 'email') }}

    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ clearErrors('invalid_field') }}

    <!-- Test reset with typed fields -->
    {{ reset('name') }}
    {{ reset('email') }}

    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ reset('invalid_field') }}

    <!-- Test setError with typed fields -->
    {{ setError('name', 'Name is required') }}
    {{ setError('email', 'Email is invalid') }}
    {{ setError({ name: 'Name is required', email: 'Email is invalid' }) }}

    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ setError('invalid_field', 'Error') }}
    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ setError({ invalid_field: 'Error' }) }}

    <!-- Test valid/invalid with typed fields -->
    {{ valid('name') }}
    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ valid('invalid_field') }}

    {{ invalid('email') }}
    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    {{ invalid('invalid_field') }}

    <div>
      <input name="name" />
      <span v-if="errors.name">{{ errors.name }}</span>
      <input name="email" />
      <span v-if="errors.email">{{ errors.email }}</span>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
