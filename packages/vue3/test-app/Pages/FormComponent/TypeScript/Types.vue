<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { FormComponentSlotProps, FormComponentonSubmitCompleteArguments } from '@inertiajs/core'

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

function handleSubmitComplete(props: FormComponentonSubmitCompleteArguments<UserForm>) {
  const { reset, defaults } = props

  reset('name')
  reset('email')

  // @ts-expect-error - 'invalid_field' should not be a valid key
  reset('invalid_field')

  defaults()
}
</script>

<template>
  <div>{{ renderFormContent.toString() }}{{ handleSubmitComplete.toString() }}</div>
</template>
