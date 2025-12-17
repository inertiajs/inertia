<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

const form = useFormContext()
</script>

<template>
  <div v-if="form" id="deeply-nested-state">
    <span>Deeply Nested: Form is {{ form.isDirty ? 'dirty' : 'clean' }}</span>
  </div>
  <div v-else id="deeply-nested-no-context">No context</div>
</template>
