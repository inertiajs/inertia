<script setup>
import { useForm } from '@inertiajs/vue3'
const form = useForm({
  name: 'foo',
  handle: 'example',
  remember: false,
})

const submit = () => {
  form.post('/form-helper/errors')
}

const clearErrors = () => {
  form.clearErrors()
}

const clearError = () => {
  form.clearErrors('handle')
}

const setErrors = () => {
  form.setError({
    name: 'Manually set Name error',
    handle: 'Manually set Handle error',
  })
}

const setError = () => {
  form.setError('handle', 'Manually set Handle error')
}
</script>

<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>
    <span class="name_error" v-if="form.errors.name">{{ form.errors.name }}</span>
    <label>
      Handle
      <input type="text" id="handle" name="handle" v-model="form.handle" />
    </label>
    <span class="handle_error" v-if="form.errors.handle">{{ form.errors.handle }}</span>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
    </label>
    <span class="remember_error" v-if="form.errors.remember">{{ form.errors.remember }}</span>

    <button @click="submit" class="submit">Submit form</button>

    <button @click="clearErrors" class="clear">Clear all errors</button>
    <button @click="clearError" class="clear-one">Clear one error</button>
    <button @click="setErrors" class="set">Set errors</button>
    <button @click="setError" class="set-one">Set one error</button>

    <span class="errors-status">Form has {{ form.hasErrors ? '' : 'no ' }}errors</span>
  </div>
</template>
