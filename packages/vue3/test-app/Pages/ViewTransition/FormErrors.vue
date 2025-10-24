<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({ name: '' })

const submit = () => {
  form.post('/view-transition/form-errors', {
    viewTransition: (viewTransition) => {
      viewTransition.ready.then(() => console.log('ready'))
      viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
      viewTransition.finished.then(() => console.log('finished'))
    },
  })
}
</script>

<template>
  <div>
    <h1>View Transition Form Errors Test</h1>

    <label>
      Name
      <input id="name" v-model="form.name" type="text" name="name" />
    </label>

    <p v-if="form.errors.name" class="name_error">{{ form.errors.name }}</p>

    <button class="submit" @click="submit">Submit with View Transition</button>
  </div>
</template>
