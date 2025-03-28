<script setup>
import { Link, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

const form = useForm('form', {
  name: 'foo',
  handle: 'example',
  remember: false,
})

const untracked = ref('')

const submit = () => {
  form.post('/remember/form-helper/remember')
}

const reset = () => {
  form.reset('handle').clearErrors('name')
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
    <label>
      Untracked
      <input type="text" id="untracked" name="untracked" v-model="untracked" />
    </label>

    <button @click="submit" class="submit">Submit form</button>
    <button @click="reset" class="reset-one">Reset one field & error</button>

    <Link href="/dump/get" class="link">Navigate away</Link>
  </div>
</template>
