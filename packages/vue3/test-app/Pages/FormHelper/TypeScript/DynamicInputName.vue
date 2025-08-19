<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/vue3'

interface ClientForm {
  name: string
  [key: string]: any
}

const form = useForm<ClientForm>({
  name: '',
})

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const { name, value } = target
  form[name] = value
}
</script>

<template>
  <input name="name" type="text" :value="form.name" @input="handleChange" />
</template>
