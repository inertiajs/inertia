<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { FormComponentOnSubmitCompleteArguments, FormComponentProps, FormComponentSlotProps } from '@inertiajs/core'

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

function handleSubmitComplete(props: FormComponentOnSubmitCompleteArguments<UserForm>) {
  const { reset, defaults } = props

  reset('name')
  reset('email')

  // @ts-expect-error - 'invalid_field' should not be a valid key
  reset('invalid_field')

  defaults()
}

function checkResetProps() {
  const valid: FormComponentProps<UserForm> = {
    resetOnSuccess: ['name', 'email'],
    resetOnError: ['name'],
  }

  const validBoolean: FormComponentProps<UserForm> = {
    resetOnSuccess: true,
    resetOnError: false,
  }

  const invalid: FormComponentProps<UserForm> = {
    // @ts-expect-error - 'invalid_field' should not be a valid key
    resetOnSuccess: ['invalid_field'],
    // @ts-expect-error - 'another_invalid' should not be a valid key
    resetOnError: ['another_invalid'],
  }

  return { valid, validBoolean, invalid }
}
</script>

<template>
  <div>{{ renderFormContent.toString() }}{{ handleSubmitComplete.toString() }}{{ checkResetProps.toString() }}</div>
</template>
