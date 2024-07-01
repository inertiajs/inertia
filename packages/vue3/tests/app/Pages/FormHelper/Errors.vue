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

    <span @click="submit" class="submit">Submit form</span>

    <span @click="clearErrors" class="clear">Clear all errors</span>
    <span @click="clearError" class="clear-one">Clear one error</span>
    <span @click="setErrors" class="set">Set errors</span>
    <span @click="setError" class="set-one">Set one error</span>

    <span class="errors-status">Form has {{ form.hasErrors ? '' : 'no ' }}errors</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: this.$inertia.form({
        name: 'foo',
        handle: 'example',
        remember: false,
      }),
    }
  },
  methods: {
    submit() {
      this.form.post('/form-helper/errors')
    },
    clearErrors() {
      this.form.clearErrors()
    },
    clearError() {
      this.form.clearErrors('handle')
    },
    setErrors() {
      this.form.setError({
        name: 'Manually set Name error',
        handle: 'Manually set Handle error',
      })
    },
    setError() {
      this.form.setError('handle', 'Manually set Handle error')
    },
  },
}
</script>
