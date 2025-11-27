<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

// This should return undefined since it's not inside a Form component
const form = useFormContext()
</script>

<template>
  <div id="outside-form-component" style="border: 2px solid red; padding: 10px; margin: 10px 0">
    <h4>Component Outside Form (testing no context)</h4>

    <div v-if="form === undefined" id="no-context-message">
      ✓ Correctly returns undefined when used outside a Form component
    </div>

    <div v-else id="unexpected-context">⚠ Unexpectedly has form context!</div>
  </div>
</template>
