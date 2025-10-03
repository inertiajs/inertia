<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const errorBag = ref<string | null>(null)

function setErrorBag(bag: string) {
  errorBag.value = bag
}
</script>

<template>
  <Form
    :action="errorBag ? '/form-component/errors/bag' : '/form-component/errors'"
    method="post"
    v-slot="{ errors, hasErrors, setError, clearErrors }"
    v-bind="errorBag ? { errorBag } : {}"
  >
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
      <button type="button" @click="setErrorBag('bag')">Use Error Bag</button>
    </div>

    <button type="submit">Submit</button>
  </Form>
</template>
