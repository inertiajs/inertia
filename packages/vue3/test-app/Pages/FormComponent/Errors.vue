<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <Form action="/form-component/errors" method="post" v-slot="{ errors, hasErrors, setError, clearErrors }">
    <h1>Form Errors</h1>

    <div>
      <div v-if="hasErrors">Form has errors</div>
      <div v-else>No errors</div>
    </div>

    <div>
      <label for="name">Name</label>
      <input type="text" name="name" id="name" />
      <div id="error_name">{{ errors.name }}</div>
    </div>

    <div>
      <label for="handle">Handle</label>
      <input type="text" name="handle" id="handle" />
      <div id="error_handle">{{ errors.handle }}</div>
    </div>

    <div>
      <button
        type="button"
        @click="
          setError({
            name: 'The name field is required.',
            handle: 'The handle field is invalid.',
          })
        "
      >
        Set Errors
      </button>
      <button type="button" @click="clearErrors()">Clear Errors</button>
      <button type="button" @click="clearErrors('name')">Clear Name Error</button>
    </div>

    <button type="submit">Submit</button>
  </Form>
</template>
