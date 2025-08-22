<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
const form = useForm({ name: 'foo', foo: [] as string[] })

const submit = () => {
  form.post('')
}

const defaults = () => {
  form.defaults()
}

const dataAndDefaults = () => {
  pushValue()
  defaults()
}

const pushValue = () => {
  form.foo.push('bar')
}

const submitAndSetDefaults = () => {
  form.post('/form-helper/dirty/redirect-back', {
    onSuccess: () => form.defaults(),
  })
}

const submitAndSetCustomDefaults = () => {
  form.post('/form-helper/dirty/redirect-back', {
    onSuccess: () => form.defaults({ name: 'Custom Default', foo: [] }),
  })
}
</script>

<template>
  <div>
    <div>Form is <span v-if="form.isDirty">dirty</span><span v-else>clean</span></div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>

    <button @click="submit" class="submit">Submit form</button>

    <button @click="defaults" class="defaults">Defaults</button>

    <button @click="dataAndDefaults" class="data-and-defaults">Data and Defaults</button>

    <button @click="pushValue" class="push">Push value</button>

    <button @click="submitAndSetDefaults" class="submit-and-set-defaults">Submit and setDefaults</button>

    <button @click="submitAndSetCustomDefaults" class="submit-and-set-custom-defaults">
      Submit and setDefaults custom
    </button>
  </div>
</template>
