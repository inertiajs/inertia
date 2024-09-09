<script setup>
import { useForm, usePage } from '@inertiajs/vue3'

const form = useForm({
  name: 'foo',
  handle: 'example',
  remember: false,
})

const page = usePage()

const submit = () => {
  form.post(page.url)
}

const resetAll = () => {
  form.reset()
}

const resetOne = () => {
  form.reset('handle')
}

const reassign = () => {
  form.defaults()
}

const reassignObject = () => {
  form.defaults({
    handle: 'updated handle',
    remember: true,
  })
}

const reassignSingle = () => {
  form.defaults('name', 'single value')
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

    <button @click="resetAll" class="reset">Reset all data</button>
    <button @click="resetOne" class="reset-one">Reset one field</button>

    <button @click="reassign" class="reassign">Reassign current as defaults</button>
    <button @click="reassignObject" class="reassign-object">Reassign default values</button>
    <button @click="reassignSingle" class="reassign-single">Reassign single default</button>

    <span class="errors-status">Form has {{ form.hasErrors ? '' : 'no ' }}errors</span>
  </div>
</template>
