<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { createForm } from '@inertiajs/vue3'

interface UserForm {
  name: string
  email: string
}

const TypedForm = createForm<UserForm>()
</script>

<template>
  <div>
    <TypedForm
      method="post"
      action="/form-component/types"
      :reset-on-success="['name', 'email']"
      :reset-on-error="['name']"
    >
      <template #default="{ errors, getData, clearErrors, reset }">
        {{ errors.name }} {{ errors.email }}
        {{ getData().name }} {{ getData().email }}
        {{ clearErrors('name', 'email') }}
        {{ reset('name') }}
        {{ reset('email') }}
        <div>Form content</div>
      </template>
    </TypedForm>

    <TypedForm method="post" action="/form-component/types" :reset-on-success="true" :reset-on-error="false">
      <template #default>
        <div>Boolean reset</div>
      </template>
    </TypedForm>
  </div>
</template>
