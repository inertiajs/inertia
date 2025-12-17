<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

const form = useFormContext()
</script>

<template>
  <div v-if="form === undefined" id="no-context-message">
    Correctly returns undefined when used outside a Form component
  </div>
  <div v-else id="unexpected-context">Unexpectedly has form context</div>
</template>
