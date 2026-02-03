<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  handle: '',
})

const submit = () => {
  form.post('/form-helper/errors/clear-on-resubmit')
}
</script>

<template>
  <div>
    <label>
      Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>
    <span id="name-error" v-if="form.errors.name">{{ form.errors.name }}</span>

    <label>
      Handle
      <input type="text" id="handle" name="handle" v-model="form.handle" />
    </label>
    <span id="handle-error" v-if="form.errors.handle">{{ form.errors.handle }}</span>

    <button @click="submit" id="submit">Submit</button>

    <span class="errors-status">Form has {{ form.hasErrors ? '' : 'no ' }}errors</span>
  </div>
</template>
