<script setup lang="ts">
import { useForm, usePage, usePoll } from '@inertiajs/vue3'

defineProps<{
  time: number
}>()

const page = usePage()

const form = useForm({
  name: '',
})

const submit = () => {
  form.post('/poll/preserve-errors')
}

usePoll(300, {
  only: ['time'],
})
</script>

<template>
  <p v-if="page.props.errors?.name" id="page-error">{{ page.props.errors.name }}</p>
  <p v-if="form.errors.name" id="form-error">{{ form.errors.name }}</p>

  <button type="button" @click="submit">Submit</button>

  <p id="time">Time: {{ time }}</p>
</template>
