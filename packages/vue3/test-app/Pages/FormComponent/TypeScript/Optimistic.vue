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
  <div>
    <Form
      action="/users"
      method="post"
      :optimistic="
        (props, formData) => {
          const name: string = formData.name
          const email: string = formData.email
          return { ...props, user: { name, email } }
        }
      "
      :transform="
        (data) => {
          const name: string = data.name
          const email: string = data.email
          return { name, email }
        }
      "
    >
      <input name="name" />
      <input name="email" />
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
