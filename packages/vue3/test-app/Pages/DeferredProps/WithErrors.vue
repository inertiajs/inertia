<script setup lang="ts">
import { Deferred, useForm } from '@inertiajs/vue3'

defineProps<{
  foo?: { text: string }
}>()

const form = useForm({
  name: '',
})

const submit = () => {
  form.post('/deferred-props/with-errors')
}
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>

    <div id="foo">{{ foo?.text }}</div>
  </Deferred>

  <p v-if="$page.props.errors?.name" id="page-error">{{ $page.props.errors.name }}</p>
  <p v-if="form.errors.name" id="form-error">{{ form.errors.name }}</p>

  <button type="button" @click="submit">Submit</button>
</template>
