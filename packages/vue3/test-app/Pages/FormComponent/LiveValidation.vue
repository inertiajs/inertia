<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

onMounted(async () => {
  await import('../../mockProvider')
})

// Display only; provider handles validation. We expose `validating` from slot.
const validatingA = ref(false)
const validatingB = ref(false)
</script>

<template>
  <div>
    <h1>Live Validation Demo (Provider-based)</h1>

    <!-- Provider-based form A: per-field opt-in via data-precognitive -->
    <Form
      action="/dump/post"
      method="post"
      :precognitive="false"
      validateOn="input"
      :validationTimeout="120"
      v-slot="{ errors, validating }"
    >
      <h2>Provider: Per-field Opt-in</h2>
      <div>Validating: <span id="validatingA">{{ (validatingA = validating), validating }}</span></div>

      <div>
        <label for="name">Name</label>
        <!-- per-field opt-in -->
        <input id="name" name="name" data-precognitive="true" />
        <div id="error_name">{{ errors.name }}</div>
      </div>

      <div>
        <label for="email">Email</label>
        <!-- no precognitive attribute on purpose -->
        <input id="email" name="email" />
        <div id="error_email">{{ errors.email }}</div>
      </div>

      <button type="submit">Submit</button>
    </Form>

    <hr />

    <!-- Provider-based form B: global precognitive -->
    <Form action="/dump/post" method="post" :precognitive="true" validateOn="input" v-slot="{ errors, validating }">
      <h2>Provider: Global Precognitive</h2>
      <div>Validating: <span id="validatingB">{{ (validatingB = validating), validating }}</span></div>
      <div>
        <label for="gp_name">Name</label>
        <input id="gp_name" name="name" />
        <div id="gp_error_name">{{ errors.name }}</div>
      </div>
    </Form>
  </div>
</template>
