<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

const form = useFormContext()
</script>

<template>
  <div v-if="form === undefined">Correctly returns undefined when used outside a Form component</div>
  <div v-else>Unexpectedly has form context</div>
</template>
