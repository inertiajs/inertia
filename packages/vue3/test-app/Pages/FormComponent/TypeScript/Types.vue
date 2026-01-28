<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { FormComponentSlotProps } from '@inertiajs/core'

interface UserForm {
  name: string
  email: string
}

function renderFormContent(props: FormComponentSlotProps<UserForm>) {
  const { errors, getData, clearErrors } = props

  console.log(errors.name, errors.email)

  const data = getData()
  console.log(data.name, data.email)

  clearErrors('name', 'email')

  // @ts-expect-error - 'invalid_field' should not be a valid key
  clearErrors('invalid_field')

  return 'Form content'
}
</script>

<template>
  <div>{{ renderFormContent.toString() }}</div>
</template>
