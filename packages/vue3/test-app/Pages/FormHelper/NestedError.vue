<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  foo: {
    bar: '',
  },
  baz: '',
})
</script>

<template>
  <p v-if="form.errors['baz']">{{ form.errors['baz'] }}</p>
  <p v-if="form.errors['foo.bar']">{{ form.errors['foo.bar'] }}</p>
</template>
