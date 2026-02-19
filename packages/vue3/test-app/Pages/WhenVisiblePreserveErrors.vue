<script setup lang="ts">
import { WhenVisible, useForm } from '@inertiajs/vue3'

defineProps<{
  foo?: string
}>()

const form = useForm({
  name: '',
})

const submit = () => {
  form.post('/when-visible/preserve-errors')
}
</script>

<template>
  <p v-if="$page.props.errors?.name" id="page-error">{{ $page.props.errors.name }}</p>
  <p v-if="form.errors.name" id="form-error">{{ form.errors.name }}</p>

  <button type="button" @click="submit">Submit</button>

  <div style="height: 2000px"></div>

  <WhenVisible data="foo">
    <template #fallback>
      <div id="loading">Loading foo...</div>
    </template>

    <div id="foo">Foo: {{ foo }}</div>
  </WhenVisible>
</template>
